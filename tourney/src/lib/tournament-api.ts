import { supabase } from './supabase'
import { Match, Team } from '@/types/tournament'

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

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

function dbMatchToMatch(dbMatch: any, team1: any, team2: any): Match {
  return {
    id: dbMatch.id,
    matchNumber: dbMatch.match_number,
    date: dbMatch.scheduled_time ? new Date(dbMatch.scheduled_time).toISOString().split('T')[0] : '',
    time: dbMatch.scheduled_time ? new Date(dbMatch.scheduled_time).toTimeString().split(' ')[0].slice(0, 5) : '',
    venue: (dbMatch.venue || dbMatch.court || 'TBD') as Match['venue'],
    division: team1?.division || team2?.division || 'boys',
    round: `Round ${dbMatch.round}`,
    teamA: team1 ? dbTeamToTeam(team1) : { id: '', name: 'TBD', group: '', division: 'boys' as const },
    teamB: team2 ? dbTeamToTeam(team2) : { id: '', name: 'TBD', group: '', division: 'boys' as const },
    scoreA: dbMatch.score1,
    scoreB: dbMatch.score2,
    status: dbMatch.status === 'pending' ? 'scheduled' : dbMatch.status,
    updatedAt: dbMatch.created_at
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