#!/usr/bin/env node

// Script to check qualified teams and their IDs
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function checkQualifiedTeams() {
  console.log('🔍 Checking Qualified Teams...\n')
  
  // Get all teams with qualification status
  const { data: qualifiedTeams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .or('qualification_status.eq.qualified,qualification_status.eq.active')
    .in('division', ['boys', 'girls'])
    .order('pool', { ascending: true })
  
  console.log(`Found ${qualifiedTeams?.length || 0} qualified teams\n`)
  
  // Group by division
  const boysTeams = qualifiedTeams?.filter(t => t.division === 'boys' && t.pool?.startsWith('L')) || []
  const girlsTeams = qualifiedTeams?.filter(t => t.division === 'girls' && t.pool?.startsWith('P')) || []
  
  console.log('Boys Division Qualified Teams:')
  console.log('='.repeat(60))
  boysTeams.forEach(team => {
    console.log(`   ${team.pool}: ${team.team_name} (ID: ${team.id})`)
    console.log(`      - Position: ${team.group_position || 'not set'}`)
    console.log(`      - Status: ${team.qualification_status}`)
  })
  
  console.log('\nGirls Division Qualified Teams:')
  console.log('='.repeat(60))
  girlsTeams.forEach(team => {
    console.log(`   ${team.pool}: ${team.team_name} (ID: ${team.id})`)
    console.log(`      - Position: ${team.group_position || 'not set'}`)
    console.log(`      - Status: ${team.qualification_status}`)
  })
  
  // Check placeholder teams
  console.log('\n' + '='.repeat(60))
  console.log('Checking Placeholder Teams:')
  
  const { data: placeholderTeams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .or('team_name.like.%Winner%,team_name.like.%Champion%')
    .limit(10)
  
  console.log(`Found ${placeholderTeams?.length || 0} placeholder teams`)
  placeholderTeams?.forEach(team => {
    console.log(`   ${team.team_name} (ID: ${team.id}, Pool: ${team.pool})`)
  })
  
  // Check knockout matches
  console.log('\n' + '='.repeat(60))
  console.log('Sample Knockout Matches:')
  
  const { data: knockoutMatches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(team_name), team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 102)
    .lte('match_number', 107)
    .order('match_number', { ascending: true })
  
  knockoutMatches?.forEach(match => {
    console.log(`   Match #${match.match_number}: ${match.team1?.team_name || 'TBD'} vs ${match.team2?.team_name || 'TBD'}`)
  })
}

// Run the check
checkQualifiedTeams()
  .then(() => {
    console.log('\n✅ Check complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })