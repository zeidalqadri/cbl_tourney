#!/usr/bin/env node

// Script to calculate boys second round group standings and identify winners
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Boys second round group structure
const BOYS_GROUPS = {
  LXA: {
    teams: ['CHENG (B)', 'MALIM (B)', 'WEN HUA (B)'],
    matches: [103, 110, 117],
    advancesTo: 125,
    position: 'team1'
  },
  LXB: {
    teams: ['BKT BERUANG (B)', 'PAY FONG 2 (B)', 'YU HSIEN (B)'],
    matches: [108, 115, 122],
    advancesTo: 125,
    position: 'team2'
  },
  LYA: {
    teams: ['BACHANG (B)', 'MERLIMAU (B)', 'PAY CHIAO (B)', 'YU HWA (B)'],
    matches: [106, 107, 113, 114, 120, 121],
    advancesTo: 127,
    position: 'team1'
  },
  LYB: {
    teams: ['ALOR GAJAH (B)', 'CHABAU (B)', 'PAY CHEE (B)', 'PAY FONG 1 (B)'],
    matches: [104, 105, 111, 112, 118, 119],
    advancesTo: 127,
    position: 'team2'
  }
}

async function calculateBoysGroupStandings() {
  console.log('🏀 Calculating Boys Second Round Group Standings...\n')
  
  // Get all boys second round matches
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
  
  const groupResults = {}
  
  for (const [groupName, groupData] of Object.entries(BOYS_GROUPS)) {
    console.log(`📊 Group ${groupName}:`)
    console.log('='.repeat(60))
    
    // Get matches for this group
    const groupMatches = allMatches?.filter(match => 
      groupData.matches.includes(match.match_number)
    ) || []
    
    // Initialize team standings
    const standings = {}
    groupData.teams.forEach(team => {
      standings[team] = {
        team,
        played: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        points: 0 // Tournament points (2 for win, 1 for loss)
      }
    })
    
    // Process completed matches
    const completedMatches = groupMatches.filter(m => m.status === 'completed')
    const totalMatches = groupMatches.length
    
    completedMatches.forEach(match => {
      const team1 = match.team1?.team_name
      const team2 = match.team2?.team_name
      
      if (team1 && team2 && standings[team1] && standings[team2]) {
        // Update match counts
        standings[team1].played++
        standings[team2].played++
        
        // Update scores
        const score1 = match.score1 || 0
        const score2 = match.score2 || 0
        
        standings[team1].pointsFor += score1
        standings[team1].pointsAgainst += score2
        standings[team2].pointsFor += score2
        standings[team2].pointsAgainst += score1
        
        // Determine winner
        if (score1 > score2) {
          standings[team1].wins++
          standings[team1].points += 2
          standings[team2].losses++
          standings[team2].points += 1
        } else if (score2 > score1) {
          standings[team2].wins++
          standings[team2].points += 2
          standings[team1].losses++
          standings[team1].points += 1
        }
      }
    })
    
    // Calculate point differentials
    Object.values(standings).forEach(team => {
      team.pointDiff = team.pointsFor - team.pointsAgainst
    })
    
    // Sort standings: by wins desc, then by point diff desc, then by points for desc
    const sortedStandings = Object.values(standings).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
      return b.pointsFor - a.pointsFor
    })
    
    // Display standings
    console.log('Pos | Team                | P  W  L | PF  PA  Diff | Pts')
    console.log('-'.repeat(60))
    
    sortedStandings.forEach((team, index) => {
      const pos = (index + 1).toString().padStart(2)
      const teamName = team.team.padEnd(18)
      const played = team.played.toString().padStart(2)
      const wins = team.wins.toString().padStart(2)
      const losses = team.losses.toString().padStart(2)
      const pf = team.pointsFor.toString().padStart(3)
      const pa = team.pointsAgainst.toString().padStart(3)
      const diff = team.pointDiff >= 0 ? `+${team.pointDiff}` : team.pointDiff.toString()
      const diffFormatted = diff.padStart(5)
      const pts = team.points.toString().padStart(3)
      const crown = index === 0 ? '👑' : ' '
      
      console.log(`${crown}${pos} | ${teamName} | ${played} ${wins} ${losses} | ${pf} ${pa} ${diffFormatted} | ${pts}`)
    })
    
    // Check if group is complete
    const isComplete = completedMatches.length === totalMatches
    const winner = sortedStandings[0]
    
    console.log(`\nGroup Status: ${completedMatches.length}/${totalMatches} matches completed`)
    
    if (isComplete) {
      console.log(`🏆 GROUP WINNER: ${winner.team}`)
      console.log(`   → Advances to Semi-Final Match #${groupData.advancesTo} as ${groupData.position}`)
    } else {
      console.log(`🔄 Current Leader: ${winner.team} (subject to change)`)
    }
    
    // Store results for progression
    groupResults[groupName] = {
      standings: sortedStandings,
      isComplete,
      winner: winner.team,
      winnerId: null, // Will be populated when we get team IDs
      advancesTo: groupData.advancesTo,
      position: groupData.position
    }
    
    console.log('\n' + '='.repeat(60) + '\n')
  }
  
  // Summary
  console.log('🏆 BOYS SECOND ROUND SUMMARY')
  console.log('='.repeat(60))
  
  Object.entries(groupResults).forEach(([groupName, result]) => {
    const status = result.isComplete ? '✅ Complete' : '⏳ In Progress'
    console.log(`${groupName}: ${result.winner} ${status}`)
    if (result.isComplete) {
      console.log(`   → Advances to Semi-Final #${result.advancesTo}`)
    }
  })
  
  // Check semi-finals status
  console.log('\n📅 Semi-Finals Status:')
  console.log('-'.repeat(40))
  
  const { data: semiFinals } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
      team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [125, 127])
    .order('match_number')
  
  semiFinals?.forEach(match => {
    const team1 = match.team1?.team_name || 'TBD'
    const team2 = match.team2?.team_name || 'TBD'
    console.log(`Match #${match.match_number}: ${team1} vs ${team2}`)
  })
  
  return groupResults
}

// Also provide a function to get team IDs for progression
async function getTeamIds(groupResults) {
  console.log('\n🔍 Getting Team IDs for Progression...\n')
  
  for (const [groupName, result] of Object.entries(groupResults)) {
    if (result.isComplete) {
      const { data: team } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('team_name', result.winner)
        .single()
      
      if (team) {
        result.winnerId = team.id
        console.log(`${groupName} winner ${result.winner}: ID = ${team.id}`)
      } else {
        console.log(`❌ Could not find team ID for ${result.winner}`)
      }
    }
  }
  
  return groupResults
}

// Run the calculation
if (import.meta.url === `file://${process.argv[1]}`) {
  calculateBoysGroupStandings()
    .then(getTeamIds)
    .then((results) => {
      console.log('\n✅ Boys group standings calculation complete!')
      
      // Check for any complete groups ready for progression
      const completeGroups = Object.entries(results).filter(([, result]) => result.isComplete)
      
      if (completeGroups.length > 0) {
        console.log('\n💡 Ready for progression:')
        completeGroups.forEach(([groupName, result]) => {
          console.log(`   ${groupName}: ${result.winner} → Semi-Final #${result.advancesTo}`)
        })
        console.log('\n   Run the auto-populate script to advance winners!')
      } else {
        console.log('\n⏳ No groups completed yet. Complete more matches to see progression.')
      }
      
      process.exit(0)
    })
    .catch(err => {
      console.error('Error:', err)
      process.exit(1)
    })
}

export { calculateBoysGroupStandings, getTeamIds, BOYS_GROUPS }