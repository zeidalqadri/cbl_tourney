import { Match, Team, GroupStanding, Division, TournamentStage } from '@/types/tournament'

export interface TournamentConfig {
  id: string
  name: string
  format: 'groups_to_knockout' | 'single_elimination' | 'double_elimination' | 'round_robin'
  stages: TournamentStage[]
  progression_rules: ProgressionRule[]
  division_configs: DivisionConfig[]
}

export interface ProgressionRule {
  from_stage: TournamentStage
  to_stage: TournamentStage
  qualification_count: number
  qualification_method: 'top_n' | 'percentage' | 'fixed'
  seeding_method: 'group_position' | 'points' | 'random'
}

export interface DivisionConfig {
  division: Division
  groups: string[]
  teams_per_group: number
  qualifiers_per_group: number
  knockout_rounds: KnockoutRound[]
}

export interface KnockoutRound {
  round_number: number
  stage: TournamentStage
  match_count: number
  matchup_rules: MatchupRule[]
}

export interface MatchupRule {
  match_number: number
  team_a_source: TeamSource
  team_b_source: TeamSource
}

export interface TeamSource {
  type: 'group_winner' | 'group_runner_up' | 'match_winner' | 'match_loser'
  source_id: string // group name or match id
  position?: number // for group standings
}

export class TournamentProgressionService {
  private static instance: TournamentProgressionService
  
  private constructor() {}
  
  static getInstance(): TournamentProgressionService {
    if (!TournamentProgressionService.instance) {
      TournamentProgressionService.instance = new TournamentProgressionService()
    }
    return TournamentProgressionService.instance
  }

  /**
   * Determine qualified teams from group standings
   */
  async determineQualifiedTeams(
    standings: GroupStanding[],
    qualifiersPerGroup: number
  ): Promise<Team[]> {
    // Sort standings by points, then goal difference
    const sorted = [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.points_diff - a.points_diff
    })

    // Take top N teams
    return sorted
      .slice(0, qualifiersPerGroup)
      .map(standing => ({
        id: standing.team_id,
        name: standing.team_name,
        group: standing.group_name,
        division: standing.division,
        emblemUrl: standing.team?.emblemUrl
      }))
  }

  /**
   * Generate knockout bracket matchups based on group results
   */
  generateKnockoutMatchups(
    qualifiedTeams: Map<string, Team[]>, // group -> teams
    division: Division,
    stage: TournamentStage
  ): Partial<Match>[] {
    const matches: Partial<Match>[] = []
    const groups = Array.from(qualifiedTeams.keys()).sort()
    
    if (stage === 'quarter_final') {
      // Standard bracket: A1 vs B2, B1 vs A2, etc.
      for (let i = 0; i < groups.length; i += 2) {
        if (i + 1 < groups.length) {
          const groupA = groups[i]
          const groupB = groups[i + 1]
          const teamsA = qualifiedTeams.get(groupA) || []
          const teamsB = qualifiedTeams.get(groupB) || []
          
          if (teamsA[0] && teamsB[1]) {
            matches.push({
              teamA: teamsA[0],
              teamB: teamsB[1],
              division,
              round: 'Quarter Final',
              metadata: {
                type: 'quarter_final',
                division,
                team1_placeholder: `Winner ${groupA}`,
                team2_placeholder: `Runner-up ${groupB}`
              }
            })
          }
          
          if (teamsB[0] && teamsA[1]) {
            matches.push({
              teamA: teamsB[0],
              teamB: teamsA[1],
              division,
              round: 'Quarter Final',
              metadata: {
                type: 'quarter_final',
                division,
                team1_placeholder: `Winner ${groupB}`,
                team2_placeholder: `Runner-up ${groupA}`
              }
            })
          }
        }
      }
    } else if (stage === 'semi_final') {
      // Semi-finals from quarter-final winners
      matches.push(
        {
          division,
          round: 'Semi Final',
          metadata: {
            type: 'semi_final',
            division,
            team1_placeholder: 'QF1 Winner',
            team2_placeholder: 'QF2 Winner'
          }
        },
        {
          division,
          round: 'Semi Final',
          metadata: {
            type: 'semi_final',
            division,
            team1_placeholder: 'QF3 Winner',
            team2_placeholder: 'QF4 Winner'
          }
        }
      )
    } else if (stage === 'final') {
      // Final from semi-final winners
      matches.push({
        division,
        round: 'Final',
        metadata: {
          type: 'final',
          division,
          team1_placeholder: 'SF1 Winner',
          team2_placeholder: 'SF2 Winner'
        }
      })
    }
    
    return matches
  }

  /**
   * Progress match winner to next round
   */
  progressWinnerToNextMatch(
    completedMatch: Match,
    nextMatchId: string,
    teamSlot: 'A' | 'B'
  ): { teamId: string; teamName: string } | null {
    if (completedMatch.status !== 'completed') {
      return null
    }
    
    if (completedMatch.scoreA === undefined || completedMatch.scoreB === undefined) {
      return null
    }
    
    const winner = completedMatch.scoreA > completedMatch.scoreB 
      ? completedMatch.teamA 
      : completedMatch.teamB
    
    return {
      teamId: winner.id,
      teamName: winner.name
    }
  }

  /**
   * Determine next match for a completed match winner
   */
  determineNextMatch(
    completedMatch: Match,
    bracket: Match[]
  ): { nextMatch: Match; teamSlot: 'A' | 'B' } | null {
    // Parse current round and determine next
    const currentStage = this.parseMatchStage(completedMatch)
    const nextStage = this.getNextStage(currentStage)
    
    if (!nextStage) return null
    
    // Find next round match that's waiting for this winner
    const nextMatches = bracket.filter(m => 
      this.parseMatchStage(m) === nextStage &&
      m.division === completedMatch.division &&
      (!m.teamA.id || !m.teamB.id)
    )
    
    if (nextMatches.length === 0) return null
    
    // Determine which match and slot based on match number
    const matchIndex = Math.floor((completedMatch.matchNumber - 1) / 2)
    const teamSlot = (completedMatch.matchNumber % 2) === 1 ? 'A' : 'B'
    
    return {
      nextMatch: nextMatches[matchIndex] || nextMatches[0],
      teamSlot
    }
  }

  /**
   * Parse match stage from round name
   */
  private parseMatchStage(match: Match): TournamentStage {
    const round = match.round.toLowerCase()
    if (round.includes('group')) return 'group_stage'
    if (round.includes('second')) return 'second_round'
    if (round.includes('quarter')) return 'quarter_final'
    if (round.includes('semi')) return 'semi_final'
    if (round.includes('final')) return 'final'
    return 'group_stage'
  }

  /**
   * Get next tournament stage
   */
  private getNextStage(currentStage: TournamentStage): TournamentStage | null {
    const progression: Record<TournamentStage, TournamentStage | null> = {
      'group_stage': 'second_round',
      'second_round': 'quarter_final',
      'quarter_final': 'semi_final',
      'semi_final': 'final',
      'final': null
    }
    return progression[currentStage]
  }

  /**
   * Create default MSS Melaka tournament configuration
   */
  createMSSMelakaConfig(): TournamentConfig {
    return {
      id: 'mss-melaka-2025',
      name: 'MSS Melaka Basketball U12 2025',
      format: 'groups_to_knockout',
      stages: ['group_stage', 'quarter_final', 'semi_final', 'final'],
      progression_rules: [
        {
          from_stage: 'group_stage',
          to_stage: 'quarter_final',
          qualification_count: 2,
          qualification_method: 'top_n',
          seeding_method: 'group_position'
        }
      ],
      division_configs: [
        {
          division: 'boys',
          groups: ['A', 'B', 'C', 'D'],
          teams_per_group: 4,
          qualifiers_per_group: 2,
          knockout_rounds: [
            {
              round_number: 2,
              stage: 'quarter_final',
              match_count: 4,
              matchup_rules: [
                {
                  match_number: 1,
                  team_a_source: { type: 'group_winner', source_id: 'A', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'B', position: 2 }
                },
                {
                  match_number: 2,
                  team_a_source: { type: 'group_winner', source_id: 'B', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'A', position: 2 }
                },
                {
                  match_number: 3,
                  team_a_source: { type: 'group_winner', source_id: 'C', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'D', position: 2 }
                },
                {
                  match_number: 4,
                  team_a_source: { type: 'group_winner', source_id: 'D', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'C', position: 2 }
                }
              ]
            },
            {
              round_number: 3,
              stage: 'semi_final',
              match_count: 2,
              matchup_rules: [
                {
                  match_number: 1,
                  team_a_source: { type: 'match_winner', source_id: 'QF1' },
                  team_b_source: { type: 'match_winner', source_id: 'QF2' }
                },
                {
                  match_number: 2,
                  team_a_source: { type: 'match_winner', source_id: 'QF3' },
                  team_b_source: { type: 'match_winner', source_id: 'QF4' }
                }
              ]
            },
            {
              round_number: 4,
              stage: 'final',
              match_count: 1,
              matchup_rules: [
                {
                  match_number: 1,
                  team_a_source: { type: 'match_winner', source_id: 'SF1' },
                  team_b_source: { type: 'match_winner', source_id: 'SF2' }
                }
              ]
            }
          ]
        },
        {
          division: 'girls',
          groups: ['E', 'F', 'G', 'H'],
          teams_per_group: 4,
          qualifiers_per_group: 2,
          knockout_rounds: [
            // Similar structure for girls division
            {
              round_number: 2,
              stage: 'quarter_final',
              match_count: 4,
              matchup_rules: [
                {
                  match_number: 1,
                  team_a_source: { type: 'group_winner', source_id: 'E', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'F', position: 2 }
                },
                {
                  match_number: 2,
                  team_a_source: { type: 'group_winner', source_id: 'F', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'E', position: 2 }
                },
                {
                  match_number: 3,
                  team_a_source: { type: 'group_winner', source_id: 'G', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'H', position: 2 }
                },
                {
                  match_number: 4,
                  team_a_source: { type: 'group_winner', source_id: 'H', position: 1 },
                  team_b_source: { type: 'group_runner_up', source_id: 'G', position: 2 }
                }
              ]
            },
            {
              round_number: 3,
              stage: 'semi_final',
              match_count: 2,
              matchup_rules: [
                {
                  match_number: 1,
                  team_a_source: { type: 'match_winner', source_id: 'QF1' },
                  team_b_source: { type: 'match_winner', source_id: 'QF2' }
                },
                {
                  match_number: 2,
                  team_a_source: { type: 'match_winner', source_id: 'QF3' },
                  team_b_source: { type: 'match_winner', source_id: 'QF4' }
                }
              ]
            },
            {
              round_number: 4,
              stage: 'final',
              match_count: 1,
              matchup_rules: [
                {
                  match_number: 1,
                  team_a_source: { type: 'match_winner', source_id: 'SF1' },
                  team_b_source: { type: 'match_winner', source_id: 'SF2' }
                }
              ]
            }
          ]
        }
      ]
    }
  }
}