#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function identifyBoysGroups() {
  console.log('🔍 Identifying Boys Second Round Groups...\n')
  
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
  
  console.log('All Boys Second Round Matches:')
  console.log('='.repeat(80))
  
  boysMatches.forEach(match => {
    const score = match.score1 !== null && match.score2 !== null 
      ? `${match.score1}-${match.score2}`
      : 'TBD'
    const status = match.status === 'completed' ? '✅' : '⏳'
    
    console.log(`${status} Match #${match.match_number}: ${match.team1?.team_name} vs ${match.team2?.team_name} (${score})`)
  })
  
  // Create teams graph to identify groups
  const teamConnections = {}
  const allTeams = new Set()
  
  boysMatches.forEach(match => {
    const team1 = match.team1?.team_name
    const team2 = match.team2?.team_name
    
    if (team1 && team2) {
      allTeams.add(team1)
      allTeams.add(team2)
      
      if (!teamConnections[team1]) teamConnections[team1] = new Set()
      if (!teamConnections[team2]) teamConnections[team2] = new Set()
      
      teamConnections[team1].add(team2)
      teamConnections[team2].add(team1)
    }
  })
  
  console.log(`\n\nTotal Teams: ${allTeams.size}`)
  
  // Group teams based on their connections (round-robin groups)
  const groups = []
  const assignedTeams = new Set()
  
  for (const team of allTeams) {
    if (assignedTeams.has(team)) continue
    
    const connections = teamConnections[team]
    if (connections && connections.size === 2) {
      // This team plays against exactly 2 others, so they form a group of 3
      const groupTeams = [team, ...Array.from(connections)]
      
      // Verify this is a complete group (each team plays the other 2)
      const isCompleteGroup = groupTeams.every(t => {
        const tConnections = teamConnections[t]
        return tConnections && groupTeams.filter(gt => gt !== t).every(gt => tConnections.has(gt))
      })
      
      if (isCompleteGroup) {
        groups.push(groupTeams.sort())
        groupTeams.forEach(t => assignedTeams.add(t))
      }
    }
  }
  
  console.log('\n🏀 Identified Round-Robin Groups:')
  console.log('='.repeat(60))
  
  groups.forEach((group, index) => {
    const groupName = ['LXA', 'LXB', 'LYA', 'LYB'][index] || `Group ${index + 1}`
    console.log(`\n${groupName}:`)
    group.forEach(team => console.log(`  - ${team}`))
    
    // Show matches for this group
    const groupMatches = boysMatches.filter(match => 
      group.includes(match.team1?.team_name) && group.includes(match.team2?.team_name)
    )
    
    console.log(`  Matches:`)
    groupMatches.forEach(match => {
      const score = match.score1 !== null && match.score2 !== null 
        ? `${match.score1}-${match.score2}`
        : 'TBD'
      const status = match.status === 'completed' ? '✅' : '⏳'
      console.log(`    ${status} #${match.match_number}: ${match.team1?.team_name} vs ${match.team2?.team_name} (${score})`)
    })
  })
  
  return groups
}

identifyBoysGroups()
  .then(() => {
    console.log('\n✅ Group identification complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })