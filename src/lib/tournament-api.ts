import { supabase } from './supabase'
import { Match, Team, TeamWithQualification, GroupStanding } from '@/types/tournament'

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Format placeholder names to be more user-friendly
function formatPlaceholderName(placeholder?: string): string {
  if (!placeholder) return ''
  
  // Convert patterns like "Winner PA" to "Winner of Group PA"
  if (placeholder.startsWith('Winner ')) {
    const group = placeholder.replace('Winner ', '')
    return `Winner of Group ${group}`
  }
  
  // Convert patterns like "Runner-up PA" to "Runner-up of Group PA"
  if (placeholder.startsWith('Runner-up ')) {
    const group = placeholder.replace('Runner-up ', '')
    return `Runner-up of Group ${group}`
  }
  
  // Convert patterns like "QF1 Winner" to "Quarter Final 1 Winner"
  if (placeholder.includes('QF')) {
    return placeholder.replace('QF', 'Quarter Final ')
  }
  
  // Convert patterns like "SF1 Winner" to "Semi Final 1 Winner"
  if (placeholder.includes('SF')) {
    return placeholder.replace('SF', 'Semi Final ')
  }
  
  return placeholder
}

// Convert database types to app types
function dbTeamToTeam(dbTeam: any): Team {
  return {
    id: dbTeam.id,
    name: dbTeam.team_name,
    group: dbTeam.pool || '',
    division: dbTeam.division as 'boys' | 'girls',
    emblemUrl: dbTeam.metadata?.emblem_url
  }
}

function dbTeamToTeamWithQualification(dbTeam: any): TeamWithQualification {
  return {
    ...dbTeamToTeam(dbTeam),
    qualificationStatus: dbTeam.qualification_status || 'active',
    currentStage: dbTeam.current_stage || 'group_stage',
    finalPosition: dbTeam.final_position
  }
}

function dbMatchToMatch(dbMatch: any, team1: any, team2: any): Match {
  // Determine round name based on round number and metadata
  let roundName = `Round ${dbMatch.round}`;
  if (dbMatch.metadata?.type) {
    const typeMap: Record<string, string> = {
      'quarter_final': 'Quarter Final',
      'semi_final': 'Semi Final',
      'final': 'Final',
      'second_round': 'Second Round',
      'group_stage': 'Group Stage'
    };
    roundName = typeMap[dbMatch.metadata.type] || roundName;
  } else if (dbMatch.round === 1) {
    roundName = 'Group Stage';
  } else if (dbMatch.round === 2) {
    roundName = 'Second Round';
  } else if (dbMatch.round === 3) {
    roundName = 'Semi Final';
  } else if (dbMatch.round === 4) {
    roundName = 'Final';
  }

  return {
    id: dbMatch.id,
    matchNumber: dbMatch.match_number,
    date: dbMatch.scheduled_time ? new Date(dbMatch.scheduled_time).toISOString().split('T')[0] : '',
    time: dbMatch.scheduled_time ? new Date(dbMatch.scheduled_time).toTimeString().split(' ')[0].slice(0, 5) : '',
    venue: (dbMatch.venue || dbMatch.court || 'TBD') as Match['venue'],
    division: team1?.division || team2?.division || dbMatch.metadata?.division || 'boys',
    round: roundName,
    teamA: team1 ? dbTeamToTeam(team1) : { 
      id: '', 
      name: formatPlaceholderName(dbMatch.metadata?.team1_placeholder) || 'Awaiting Team', 
      group: '', 
      division: (dbMatch.metadata?.division || 'boys') as 'boys' | 'girls'
    },
    teamB: team2 ? dbTeamToTeam(team2) : { 
      id: '', 
      name: formatPlaceholderName(dbMatch.metadata?.team2_placeholder) || 'Awaiting Team', 
      group: '', 
      division: (dbMatch.metadata?.division || 'boys') as 'boys' | 'girls'
    },
    scoreA: dbMatch.score1,
    scoreB: dbMatch.score2,
    status: dbMatch.status === 'pending' ? 'scheduled' : dbMatch.status,
    updatedAt: dbMatch.created_at,
    metadata: dbMatch.metadata
  }
}

// Team functions
export async function getTeams(division?: 'boys' | 'girls') {
  let query = supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
  
  if (division) {
    query = query.eq('division', division)
  }
  
  const { data, error } = await query.order('pool', { ascending: true })
  
  if (error) throw error
  return data?.map(dbTeamToTeam) || []
}

// Match functions
export async function getMatches(filters?: {
  date?: string
  division?: 'boys' | 'girls'
  status?: 'scheduled' | 'in_progress' | 'completed'
}) {
  let query = supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
  
  if (filters?.status) {
    const statusMap = {
      'scheduled': 'pending',
      'in_progress': 'in_progress',
      'completed': 'completed'
    }
    query = query.eq('status', statusMap[filters.status] || filters.status)
  }
  
  const { data, error } = await query.order('match_number', { ascending: true })
  
  if (error) throw error
  
  const matches = data?.map((item: any) => 
    dbMatchToMatch(item, item.team1, item.team2)
  ) || []
  
  // Filter by date and division after mapping since they're derived from the data
  return matches.filter(match => {
    if (filters?.date && match.date !== filters.date) return false
    if (filters?.division && match.division !== filters.division) return false
    return true
  })
}

export async function getMatch(matchId: string) {
  const { data, error } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('id', matchId)
    .single()
  
  if (error) throw error
  
  return dbMatchToMatch(data, data.team1, data.team2)
}

export async function updateMatchScore(
  matchId: string, 
  scoreA: number, 
  scoreB: number
) {
  const { data: match } = await supabase
    .from('tournament_matches')
    .select('team1_id, team2_id')
    .eq('id', matchId)
    .single()
    
  const updates: any = {
    score1: scoreA,
    score2: scoreB,
    status: 'completed'
  }
  
  // Set winner if match exists and has teams
  if (match?.team1_id && match?.team2_id) {
    if (scoreA > scoreB) {
      updates.winner_id = match.team1_id
    } else if (scoreB > scoreA) {
      updates.winner_id = match.team2_id
    }
  }
  
  const { error } = await supabase
    .from('tournament_matches')
    .update(updates)
    .eq('id', matchId)
  
  if (error) throw error
}

// Group standings
export async function getGroupStandings(groupName: string, division: 'boys' | 'girls') {
  // Get all teams in the group
  const { data: teams, error: teamsError } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('pool', groupName)
    .eq('division', division)
  
  if (teamsError) throw teamsError
  
  // Get all matches for these teams
  const teamIds = teams?.map(t => t.id) || []
  const { data: matches, error: matchesError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'completed')
    .or(`team1_id.in.(${teamIds.join(',')}),team2_id.in.(${teamIds.join(',')})`)
  
  if (matchesError) throw matchesError
  
  // Calculate standings
  const standings = teams?.map(team => {
    const teamMatches = matches?.filter(m => 
      m.team1_id === team.id || m.team2_id === team.id
    ) || []
    
    let won = 0, lost = 0, pointsFor = 0, pointsAgainst = 0
    
    teamMatches.forEach(match => {
      if (match.team1_id === team.id) {
        pointsFor += match.score1 || 0
        pointsAgainst += match.score2 || 0
        if ((match.score1 || 0) > (match.score2 || 0)) won++
        else lost++
      } else {
        pointsFor += match.score2 || 0
        pointsAgainst += match.score1 || 0
        if ((match.score2 || 0) > (match.score1 || 0)) won++
        else lost++
      }
    })
    
    return {
      team_id: team.id,
      team_name: team.team_name,
      group_name: groupName,
      division,
      played: teamMatches.length,
      won,
      lost,
      points_for: pointsFor,
      points_against: pointsAgainst,
      points_diff: pointsFor - pointsAgainst,
      points: won * 2 + lost
    }
  }) || []
  
  // Sort by points (wins), then by point differential
  return standings.sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won
    return b.points_diff - a.points_diff
  })
}

// Result cards
export async function getResultCard(matchId: string) {
  const { data, error } = await supabase
    .from('result_cards')
    .select('*')
    .or(`match_id.eq.${matchId},tournament_match_id.eq.${matchId}`)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createResultCard(
  matchId: string,
  imageUrl: string,
  squareFormatUrl: string,
  landscapeFormatUrl: string
) {
  const { data, error } = await supabase
    .from('result_cards')
    .insert({
      tournament_match_id: matchId,
      image_url: imageUrl,
      square_format_url: squareFormatUrl,
      landscape_format_url: landscapeFormatUrl
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Real-time subscriptions
export function subscribeToMatches(
  callback: (payload: any) => void,
  filters?: { division?: 'boys' | 'girls' }
) {
  const channel = supabase
    .channel('tournament-matches-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tournament_matches',
        filter: `tournament_id=eq.${TOURNAMENT_ID}`
      },
      callback
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// Get teams with qualification status
export async function getTeamsWithQualification(division?: 'boys' | 'girls') {
  let query = supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
  
  if (division) {
    query = query.eq('division', division)
  }
  
  const { data, error } = await query.order('pool', { ascending: true })
  
  if (error) throw error
  return data?.map(dbTeamToTeamWithQualification) || []
}

// Get enhanced group standings with qualification indicators and positions
export async function getEnhancedGroupStandings(groupName: string, division: 'boys' | 'girls'): Promise<GroupStanding[]> {
  const standings = await getGroupStandings(groupName, division)
  
  // Get teams with qualification status
  const { data: teams, error } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('pool', groupName)
    .eq('division', division)
  
  if (error) throw error
  
  // Merge qualification status with standings
  return standings.map((standing, index) => {
    const team = teams?.find(t => t.id === standing.team_id)
    const position = index + 1 // Calculate position based on sorted order
    return {
      ...standing,
      position,
      team: dbTeamToTeamWithQualification(team || { 
        id: standing.team_id,
        team_name: standing.team_name,
        pool: groupName,
        division
      }),
      qualification_status: team?.qualification_status || 'active',
      isQualified: position === 1 && team?.qualification_status === 'through',
      canQualify: team?.qualification_status === 'active'
    } as GroupStanding
  })
}

// Get tournament bracket with all matches organized by round
export async function getTournamentBracket(division: 'boys' | 'girls') {
  const { data, error } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('round', 2) // Second round and above
    .order('round', { ascending: true })
    .order('match_number', { ascending: true })
  
  if (error) throw error
  
  // Filter by division based on teams or metadata
  const divisionMatches = data?.filter(match => 
    match.team1?.division === division || 
    match.team2?.division === division ||
    match.metadata?.division === division
  ) || []
  
  // Group matches by round
  const bracket = {
    secondRound: divisionMatches.filter(m => m.round === 2).map(m => dbMatchToMatch(m, m.team1, m.team2)),
    quarterFinals: divisionMatches.filter(m => m.round === 2 && m.metadata?.type === 'quarter_final').map(m => dbMatchToMatch(m, m.team1, m.team2)),
    semiFinals: divisionMatches.filter(m => m.round === 3).map(m => dbMatchToMatch(m, m.team1, m.team2)),
    final: divisionMatches.filter(m => m.round === 4).map(m => dbMatchToMatch(m, m.team1, m.team2))
  }
  
  return bracket
}

// Check group completion and update bracket
export async function checkAndUpdateBracket(groupName: string, division: 'boys' | 'girls') {
  // This would typically be called by a database trigger, but can be called manually
  const { data, error } = await supabase
    .rpc('check_group_completion', {
      p_tournament_id: TOURNAMENT_ID,
      p_group_name: groupName,
      p_division: division
    })
  
  if (error) throw error
  return data
}

// Get team qualification status and path
export async function getTeamQualificationPath(teamId: string) {
  const { data: team, error: teamError } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('id', teamId)
    .single()
  
  if (teamError) throw teamError
  
  const { data: progression, error: progressionError } = await supabase
    .from('tournament_progression')
    .select('*')
    .eq('team_id', teamId)
    .order('qualified_at', { ascending: true })
  
  if (progressionError) throw progressionError
  
  return {
    team: dbTeamToTeamWithQualification(team),
    progression: progression || [],
    currentStage: team.current_stage,
    qualificationStatus: team.qualification_status,
    finalPosition: team.final_position
  }
}

// Subscribe to qualification updates
export function subscribeToQualificationUpdates(
  callback: (payload: any) => void,
  teamId?: string
) {
  let channel = supabase.channel('qualification-updates')
  
  // Subscribe to team updates
  channel = channel.on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'tournament_teams',
      filter: teamId ? `id=eq.${teamId}` : `tournament_id=eq.${TOURNAMENT_ID}`
    },
    callback
  )
  
  // Subscribe to progression updates
  channel = channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'tournament_progression',
      filter: teamId ? `team_id=eq.${teamId}` : `tournament_id=eq.${TOURNAMENT_ID}`
    },
    callback
  )
  
  channel.subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}