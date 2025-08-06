#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function completeGroupAnalysis() {
  console.log('🏀 Complete Boys Second Round Analysis...\n')
  
  // Get all boys matches in second round
  const { data: allMatches } = await supabase
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
  
  const boysMatches = allMatches?.filter(match => 
    match.team1?.division === 'boys' && match.team2?.division === 'boys'
  ) || []
  
  // Manual grouping based on match analysis
  const groups = {
    LXA: ['CHENG (B)', 'MALIM (B)', 'WEN HUA (B)'],
    LXB: ['BKT BERUANG (B)', 'PAY FONG 2 (B)', 'YU HSIEN (B)'],
    LYA: ['BACHANG (B)', 'MERLIMAU (B)', 'PAY CHIAO (B)', 'YU HWA (B)'], // This looks like 4 teams?
    LYB: ['ALOR GAJAH (B)', 'CHABAU (B)', 'PAY CHEE (B)', 'PAY FONG 1 (B)'] // This also looks like 4 teams?
  }
  
  // Let me re-analyze by looking at the actual match patterns
  const allTeams = new Set()
  const teamMatches = {}
  
  boysMatches.forEach(match => {
    const team1 = match.team1?.team_name
    const team2 = match.team2?.team_name
    
    if (team1 && team2) {
      allTeams.add(team1)
      allTeams.add(team2)
      
      if (!teamMatches[team1]) teamMatches[team1] = []
      if (!teamMatches[team2]) teamMatches[team2] = []
      
      teamMatches[team1].push({ opponent: team2, match })
      teamMatches[team2].push({ opponent: team1, match })
    }
  })
  
  console.log('Team Matchups Analysis:')
  console.log('='.repeat(80))
  
  Array.from(allTeams).sort().forEach(team => {
    const opponents = teamMatches[team]?.map(m => m.opponent) || []
    console.log(`${team}: plays against ${opponents.join(', ')} (${opponents.length} matches)`)
  })
  
  // Based on the pattern, let me identify the actual groups
  const actualGroups = {
    LXA: {
      teams: ['CHENG (B)', 'MALIM (B)', 'WEN HUA (B)'],
      matches: [103, 110, 117]
    },
    LXB: {
      teams: ['BKT BERUANG (B)', 'PAY FONG 2 (B)', 'YU HSIEN (B)'],
      matches: [108, 115, 122]
    },
    LYA: {
      teams: ['BACHANG (B)', 'MERLIMAU (B)', 'PAY CHIAO (B)', 'YU HWA (B)'],
      matches: [106, 107, 113, 114, 120, 121] // 6 matches for 4 teams (round-robin)
    },
    LYB: {
      teams: ['ALOR GAJAH (B)', 'CHABAU (B)', 'PAY CHEE (B)', 'PAY FONG 1 (B)'],
      matches: [104, 105, 111, 112, 118, 119] // 6 matches for 4 teams (round-robin)
    }
  }
  
  console.log('\n\n🏆 Final Group Structure:')
  console.log('='.repeat(80))
  
  Object.entries(actualGroups).forEach(([groupName, groupData]) => {
    console.log(`\n${groupName}: (${groupData.teams.length} teams)`)
    groupData.teams.forEach(team => console.log(`  - ${team}`))
    
    console.log(`  Matches:`)
    groupData.matches.forEach(matchNum => {
      const match = boysMatches.find(m => m.match_number === matchNum)
      if (match) {
        const score = match.score1 !== null && match.score2 !== null 
          ? `${match.score1}-${match.score2}`
          : 'TBD'
        const status = match.status === 'completed' ? '✅' : '⏳'
        console.log(`    ${status} #${match.match_number}: ${match.team1?.team_name} vs ${match.team2?.team_name} (${score})`)
      }
    })
  })
  
  // Calculate current standings for each group
  console.log('\n\n📊 Current Group Standings:')
  console.log('='.repeat(80))
  
  Object.entries(actualGroups).forEach(([groupName, groupData]) => {
    console.log(`\n${groupName}:`)
    
    const standings = {}
    groupData.teams.forEach(team => {
      standings[team] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, played: 0 }
    })
    
    groupData.matches.forEach(matchNum => {
      const match = boysMatches.find(m => m.match_number === matchNum && m.status === 'completed')
      if (match) {
        const team1 = match.team1?.team_name
        const team2 = match.team2?.team_name
        
        if (team1 && team2 && standings[team1] && standings[team2]) {
          standings[team1].played++
          standings[team2].played++
          standings[team1].pointsFor += match.score1 || 0
          standings[team1].pointsAgainst += match.score2 || 0
          standings[team2].pointsFor += match.score2 || 0
          standings[team2].pointsAgainst += match.score1 || 0
          
          if (match.score1 > match.score2) {
            standings[team1].wins++
            standings[team2].losses++
          } else if (match.score2 > match.score1) {
            standings[team2].wins++
            standings[team1].losses++
          }
        }
      }
    })
    
    // Sort by wins, then by point differential
    const sortedStandings = Object.entries(standings).sort(([,a], [,b]) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst)
    })
    
    sortedStandings.forEach(([team, stats], index) => {
      const leader = index === 0 ? '👑' : '  '
      const diff = stats.pointsFor - stats.pointsAgainst
      console.log(`   ${leader} ${team.padEnd(20)} | ${stats.played}P ${stats.wins}W ${stats.losses}L | ${stats.pointsFor}-${stats.pointsAgainst} (${diff > 0 ? '+' : ''}${diff})`)
    })
  })
  
  return actualGroups
}

completeGroupAnalysis()
  .then(() => {
    console.log('\n✅ Complete analysis finished!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })