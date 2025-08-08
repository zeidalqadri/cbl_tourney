import { supabase } from './supabase'
import { Match, Team, GroupStanding, Division } from '@/types/tournament'
import { TournamentProgressionService } from '@/services/TournamentProgressionService'
import { getGroupStandings, getMatches } from './tournament-api'

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'
const progressionService = TournamentProgressionService.getInstance()

/**
 * Check if all group stage matches are complete for a division
 */
export async function checkGroupStageComplete(division: Division): Promise<boolean> {
  const { data, error } = await supabase
    .from('tournament_matches')
    .select('status')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 1) // Group stage
    .eq('metadata->>division', division)
  
  if (error) throw error
  
  // All matches must be completed
  return data?.every(match => match.status === 'completed') || false
}

/**
 * Get qualified teams from all groups in a division
 */
export async function getQualifiedTeams(
  division: Division,
  qualifiersPerGroup: number = 2
): Promise<Map<string, Team[]>> {
  const qualifiedTeams = new Map<string, Team[]>()
  
  // Get all groups for this division
  const groups = division === 'boys' ? ['A', 'B', 'C', 'D'] : ['E', 'F', 'G', 'H']
  
  for (const group of groups) {
    const standings = await getGroupStandings(group, division)
    const qualified = await progressionService.determineQualifiedTeams(standings, qualifiersPerGroup)
    qualifiedTeams.set(group, qualified)
  }
  
  return qualifiedTeams
}

/**
 * Progress teams from group stage to knockout rounds
 */
export async function progressToKnockoutStage(division: Division) {
  // Check if group stage is complete
  const isComplete = await checkGroupStageComplete(division)
  if (!isComplete) {
    throw new Error('Group stage not complete for ' + division + ' division')
  }
  
  // Get qualified teams
  const qualifiedTeams = await getQualifiedTeams(division, 2)
  
  // Generate quarter-final matchups
  const quarterFinalMatchups = progressionService.generateKnockoutMatchups(
    qualifiedTeams,
    division,
    'quarter_final'
  )
  
  // Update existing quarter-final matches with team assignments
  for (const matchup of quarterFinalMatchups) {
    if (matchup.teamA && matchup.teamB) {
      // Find the corresponding match in database
      const { data: existingMatch } = await supabase
        .from('tournament_matches')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('round', 2)
        .eq('metadata->>type', 'quarter_final')
        .eq('metadata->>division', division)
        .eq('metadata->>team1_placeholder', matchup.metadata?.team1_placeholder)
        .single()
      
      if (existingMatch) {
        // Update with actual teams
        await supabase
          .from('tournament_matches')
          .update({
            team1_id: matchup.teamA.id,
            team2_id: matchup.teamB.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMatch.id)
      }
    }
  }
  
  // Update team qualification status
  for (const [group, teams] of qualifiedTeams) {
    for (const team of teams) {
      await supabase
        .from('tournament_teams')
        .update({
          qualification_status: 'through',
          current_stage: 'quarter_final',
          updated_at: new Date().toISOString()
        })
        .eq('id', team.id)
    }
  }
  
  return quarterFinalMatchups
}

/**
 * Progress match winner to next round
 */
export async function progressMatchWinner(matchId: string) {
  // Get the completed match
  const { data: match, error } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('id', matchId)
    .single()
  
  if (error) throw error
  if (!match) throw new Error('Match not found')
  if (match.status !== 'completed') throw new Error('Match not completed')
  
  // Determine winner
  const winnerId = match.score1 > match.score2 ? match.team1_id : match.team2_id
  const winnerTeam = match.score1 > match.score2 ? match.team1 : match.team2
  
  // Determine next match based on current round and match type
  let nextRound: number
  let nextMatchType: string
  
  if (match.metadata?.type === 'quarter_final') {
    nextRound = 3
    nextMatchType = 'semi_final'
  } else if (match.metadata?.type === 'semi_final') {
    nextRound = 4
    nextMatchType = 'final'
  } else {
    return // No progression from final
  }
  
  // Find the next match that's waiting for this winner
  const { data: nextMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', nextRound)
    .eq('metadata->>type', nextMatchType)
    .eq('metadata->>division', match.metadata?.division || winnerTeam.division)
    .is('team1_id', null)
  
  if (nextMatches && nextMatches.length > 0) {
    const nextMatch = nextMatches[0]
    
    // Determine slot (team1 or team2) based on match numbering
    const updateData = nextMatch.team1_id === null 
      ? { team1_id: winnerId }
      : { team2_id: winnerId }
    
    // Update next match with winner
    await supabase
      .from('tournament_matches')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', nextMatch.id)
    
    // Update team's current stage
    await supabase
      .from('tournament_teams')
      .update({
        current_stage: nextMatchType,
        updated_at: new Date().toISOString()
      })
      .eq('id', winnerId)
  }
  
  return winnerId
}

/**
 * Auto-fill all knockout matches based on completed group stages
 */
export async function autoFillKnockoutBracket() {
  const divisions: Division[] = ['boys', 'girls']
  const results = []
  
  for (const division of divisions) {
    try {
      const matchups = await progressToKnockoutStage(division)
      results.push({
        division,
        success: true,
        matchups: matchups.length
      })
    } catch (error) {
      results.push({
        division,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
}

/**
 * Generate match cards for completed matches
 */
export async function generateMatchCards(date: string) {
  // Get all completed matches for the date
  const matches = await getMatches({
    date,
    status: 'completed'
  })
  
  const cards = []
  
  for (const match of matches) {
    // Check if card already exists
    const { data: existing } = await supabase
      .from('result_cards')
      .select('id')
      .eq('tournament_match_id', match.id)
      .single()
    
    if (!existing) {
      // Generate new card
      const card = {
        tournament_match_id: match.id,
        match_data: match,
        generated_at: new Date().toISOString(),
        image_url: `/api/generate-card/${match.id}`, // Placeholder URL
        square_format_url: `/api/generate-card/${match.id}?format=square`,
        landscape_format_url: `/api/generate-card/${match.id}?format=landscape`
      }
      
      const { data, error } = await supabase
        .from('result_cards')
        .insert(card)
        .select()
        .single()
      
      if (!error) {
        cards.push(data)
      }
    }
  }
  
  return cards
}

/**
 * Update tournament final positions
 */
export async function updateFinalPositions(division: Division) {
  // Get final match
  const { data: finalMatch } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 4)
    .eq('metadata->>type', 'final')
    .eq('metadata->>division', division)
    .eq('status', 'completed')
    .single()
  
  if (finalMatch) {
    // Champion
    await supabase
      .from('tournament_teams')
      .update({
        final_position: 1,
        qualification_status: 'through',
        current_stage: 'final',
        updated_at: new Date().toISOString()
      })
      .eq('id', finalMatch.score1 > finalMatch.score2 ? finalMatch.team1_id : finalMatch.team2_id)
    
    // Runner-up
    await supabase
      .from('tournament_teams')
      .update({
        final_position: 2,
        qualification_status: 'through',
        current_stage: 'final',
        updated_at: new Date().toISOString()
      })
      .eq('id', finalMatch.score1 > finalMatch.score2 ? finalMatch.team2_id : finalMatch.team1_id)
  }
  
  // Get semi-final losers for 3rd/4th place
  const { data: semiMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 3)
    .eq('metadata->>type', 'semi_final')
    .eq('metadata->>division', division)
    .eq('status', 'completed')
  
  if (semiMatches) {
    for (const match of semiMatches) {
      const loserId = match.score1 > match.score2 ? match.team2_id : match.team1_id
      
      // Set as 3rd place (could implement 3rd place playoff)
      await supabase
        .from('tournament_teams')
        .update({
          final_position: 3,
          qualification_status: 'eliminated',
          current_stage: 'semi_final',
          updated_at: new Date().toISOString()
        })
        .eq('id', loserId)
    }
  }
}