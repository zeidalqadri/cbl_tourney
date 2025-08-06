#!/usr/bin/env node

// Script to analyze boys second round group structure
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function checkBoysGroups() {
  console.log('🏀 Analyzing Boys Second Round Group Structure...\n')
  
  // Get boys second round matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 103)
    .lte('match_number', 122)
    .order('match_number')
  
  // Filter boys matches only
  const boysMatches = matches?.filter(match => 
    match.team1?.division === 'boys' || match.team2?.division === 'boys'
  ) || []
  
  console.log('Boys Second Round Matches:')
  console.log('='.repeat(90))
  
  // Group matches by metadata group if available
  const groups = {}
  
  boysMatches.forEach(match => {
    const groupName = match.metadata?.group || 'Unknown'
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(match)
  })
  
  Object.entries(groups).forEach(([groupName, groupMatches]) => {
    console.log(`\n📊 Group ${groupName}:`)
    console.log('-'.repeat(60))
    
    groupMatches.forEach(match => {
      const score = match.score1 !== null && match.score2 !== null 
        ? `${match.score1}-${match.score2}`
        : 'TBD'
      const winner = match.status === 'completed' && match.score1 !== null && match.score2 !== null
        ? (match.score1 > match.score2 ? '← WIN' : 'WIN →')
        : ''
      
      console.log(`   Match #${match.match_number}: ${match.team1?.team_name} vs ${match.team2?.team_name} (${score}) ${winner}`)
    })
  })
  
  // Check semi-finals structure
  console.log('\n\n🏆 Semi-Finals Structure:')
  console.log('='.repeat(60))
  
  const { data: semiFinals } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [125, 127])
    .order('match_number')
  
  semiFinals?.forEach(match => {
    const team1 = match.team1?.team_name || 'TBD (Group Winner)'
    const team2 = match.team2?.team_name || 'TBD (Group Winner)'
    console.log(`Match #${match.match_number}: ${team1} vs ${team2}`)
  })
  
  // Analyze completed matches to determine group standings
  console.log('\n\n📈 Current Group Standings (Based on Completed Matches):')
  console.log('='.repeat(80))
  
  const completedMatches = boysMatches.filter(m => m.status === 'completed')
  const teamStats = {}
  
  completedMatches.forEach(match => {
    const team1 = match.team1?.team_name
    const team2 = match.team2?.team_name
    const group = match.metadata?.group || 'Unknown'
    
    if (!teamStats[team1]) {
      teamStats[team1] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, group }
    }
    if (!teamStats[team2]) {
      teamStats[team2] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, group }
    }
    
    teamStats[team1].pointsFor += match.score1 || 0
    teamStats[team1].pointsAgainst += match.score2 || 0
    teamStats[team2].pointsFor += match.score2 || 0
    teamStats[team2].pointsAgainst += match.score1 || 0
    
    if (match.score1 > match.score2) {
      teamStats[team1].wins++
      teamStats[team2].losses++
    } else if (match.score2 > match.score1) {
      teamStats[team2].wins++
      teamStats[team1].losses++
    }
  })
  
  // Group stats by group
  const groupStats = {}
  Object.entries(teamStats).forEach(([teamName, stats]) => {
    const group = stats.group
    if (!groupStats[group]) {
      groupStats[group] = []
    }
    groupStats[group].push({
      team: teamName,
      ...stats,
      played: stats.wins + stats.losses,
      diff: stats.pointsFor - stats.pointsAgainst
    })
  })
  
  // Sort and display group standings
  Object.entries(groupStats).forEach(([group, teams]) => {
    console.log(`\nGroup ${group}:`)
    teams.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.diff - a.diff
    })
    
    teams.forEach((team, index) => {
      const leader = index === 0 ? '👑' : '  '
      console.log(`   ${leader} ${team.team.padEnd(20)} | ${team.played}P ${team.wins}W ${team.losses}L | PF:${team.pointsFor} PA:${team.pointsAgainst} Diff:${team.diff > 0 ? '+' : ''}${team.diff}`)
    })
  })
}

// Run the analysis
checkBoysGroups()
  .then(() => {
    console.log('\n✅ Analysis complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })