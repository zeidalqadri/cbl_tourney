#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function analyzeBoysStructure() {
  console.log('🔍 Analyzing Boys Tournament Structure...\n')
  
  // Get all boys teams to understand the structure
  const { data: boysTeams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('division', 'boys')
    .order('pool')
  
  console.log('Boys Teams by Pool:')
  console.log('='.repeat(50))
  
  const poolGroups = {}
  boysTeams?.forEach(team => {
    const pool = team.pool || 'No Pool'
    if (!poolGroups[pool]) {
      poolGroups[pool] = []
    }
    poolGroups[pool].push(team.team_name)
  })
  
  Object.entries(poolGroups).forEach(([pool, teams]) => {
    console.log(`\n${pool}:`)
    teams.forEach(team => console.log(`  - ${team}`))
  })
  
  // Check qualification status
  console.log('\n\nQualification Status:')
  console.log('='.repeat(50))
  
  const qualifiedTeams = boysTeams?.filter(team => 
    team.qualification_status === 'through' || team.current_stage === 'second_round'
  ) || []
  
  console.log(`\nTeams in Second Round: ${qualifiedTeams.length}`)
  qualifiedTeams.forEach(team => {
    console.log(`  - ${team.team_name} (from ${team.pool})`)
  })
  
  // Based on standard tournament structure, let's infer the groups
  // Typically 12 teams would form 4 groups of 3 teams each
  console.log('\n\nInferred Group Structure (LXA, LXB, LYA, LYB):')
  console.log('='.repeat(60))
  
  if (qualifiedTeams.length >= 12) {
    // Let's see if we can match the pattern from the completed matches
    const { data: completedMatches } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        team1:tournament_teams!tournament_matches_team1_id_fkey(*),
        team2:tournament_teams!tournament_matches_team2_id_fkey(*)
      `)
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('status', 'completed')
      .gte('match_number', 103)
      .lte('match_number', 122)
      .order('match_number')
    
    const teamPairings = []
    completedMatches?.forEach(match => {
      if (match.team1?.division === 'boys' && match.team2?.division === 'boys') {
        teamPairings.push([match.team1.team_name, match.team2.team_name])
      }
    })
    
    console.log('\nCompleted Match Pairings:')
    teamPairings.forEach((pair, index) => {
      console.log(`  Match ${index + 1}: ${pair[0]} vs ${pair[1]}`)
    })
    
    // Try to infer group structure from match pattern
    console.log('\nAttempting to identify groups from match patterns...')
    
    // Get unique teams from completed matches
    const uniqueTeams = new Set()
    teamPairings.forEach(pair => {
      uniqueTeams.add(pair[0])
      uniqueTeams.add(pair[1])
    })
    
    console.log(`\nTeams currently playing in second round: ${uniqueTeams.size}`)
    Array.from(uniqueTeams).forEach(team => console.log(`  - ${team}`))
  }
  
  // Check semi-final structure
  console.log('\n\nSemi-Final Matches:')
  console.log('='.repeat(40))
  
  const { data: semiFinals } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [125, 127])
    .order('match_number')
  
  semiFinals?.forEach(match => {
    console.log(`Match #${match.match_number}: metadata = ${JSON.stringify(match.metadata, null, 2)}`)
  })
}

analyzeBoysStructure()
  .then(() => {
    console.log('\n✅ Analysis complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })