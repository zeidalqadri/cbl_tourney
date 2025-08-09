#!/usr/bin/env node

// Enhanced script to automatically populate winners including boys second round groups
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { calculateBoysGroupStandings, getTeamIds, BOYS_GROUPS } from './boys-group-standings.js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function autoPopulateWinners() {
  console.log('🏆 Enhanced Auto-Populating Tournament Winners...\n')
  
  let updateCount = 0
  let errorCount = 0
  
  // Step 1: Handle individual match progression (existing logic)
  console.log('📋 Step 1: Individual Match Progression')
  console.log('='.repeat(50))
  
  const { data: completedMatches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'completed')
    .not('advances_to_match_id', 'is', null)
    .not('metadata->>type', 'eq', 'second_round') // Exclude boys second round matches
  
  if (completedMatches && completedMatches.length > 0) {
    console.log(`Found ${completedMatches.length} completed matches with individual progression\n`)
    
    for (const match of completedMatches) {
      // Determine winner
      const winnerId = match.winner_id || (
        match.score1 > match.score2 ? match.team1_id :
        match.score2 > match.score1 ? match.team2_id : null
      )
      
      if (!winnerId) {
        console.log(`   ⚠️  Match #${match.match_number}: No winner (tie or no scores)`)
        continue
      }
      
      const winnerTeam = match.score1 > match.score2 ? match.team1 : match.team2
      const position = match.metadata?.advances_to_position || 'team1'
      const advancesToMatchNumber = match.metadata?.advances_to
      
      console.log(`   Match #${match.match_number}: ${winnerTeam.team_name} won`)
      console.log(`      → Advancing to Match #${advancesToMatchNumber} as ${position}`)
      
      // Check if already populated
      const { data: nextMatch } = await supabase
        .from('tournament_matches')
        .select('team1_id, team2_id')
        .eq('id', match.advances_to_match_id)
        .single()
      
      const alreadyPopulated = position === 'team1' 
        ? nextMatch?.team1_id === winnerId
        : nextMatch?.team2_id === winnerId
      
      if (alreadyPopulated) {
        console.log(`      ✅ Already populated`)
        continue
      }
      
      // Update the next match with the winner
      const updateData = {}
      if (position === 'team1') {
        updateData.team1_id = winnerId
      } else {
        updateData.team2_id = winnerId
      }
      
      const { error } = await supabase
        .from('tournament_matches')
        .update(updateData)
        .eq('id', match.advances_to_match_id)
      
      if (error) {
        console.log(`      ❌ Error: ${error.message}`)
        errorCount++
      } else {
        console.log(`      ✅ Updated Match #${advancesToMatchNumber}`)
        updateCount++
      }
    }
  } else {
    console.log('No individual matches ready for progression\n')
  }
  
  // Step 2: Handle boys group progression
  console.log('\n📋 Step 2: Boys Group Stage Progression')
  console.log('='.repeat(50))
  
  const groupResults = await calculateBoysGroupStandings()
  const groupResultsWithIds = await getTeamIds(groupResults)
  
  // Check for completed groups and advance winners
  const completedGroups = Object.entries(groupResultsWithIds).filter(([, result]) => result.isComplete)
  
  if (completedGroups.length > 0) {
    console.log(`\nFound ${completedGroups.length} completed groups ready for progression:\n`)
    
    for (const [groupName, result] of completedGroups) {
      if (!result.winnerId) {
        console.log(`   ❌ ${groupName}: Winner team ID not found for ${result.winner}`)
        errorCount++
        continue
      }
      
      console.log(`   🏆 ${groupName}: ${result.winner} (ID: ${result.winnerId})`)
      console.log(`      → Advancing to Semi-Final Match #${result.advancesTo} as ${result.position}`)
      
      // Check if already populated
      const { data: semiFinal } = await supabase
        .from('tournament_matches')
        .select('team1_id, team2_id, team1:tournament_teams!tournament_matches_team1_id_fkey(team_name), team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', result.advancesTo)
        .single()
      
      if (!semiFinal) {
        console.log(`      ❌ Semi-final match #${result.advancesTo} not found`)
        errorCount++
        continue
      }
      
      const alreadyPopulated = result.position === 'team1' 
        ? semiFinal.team1_id === result.winnerId
        : semiFinal.team2_id === result.winnerId
      
      if (alreadyPopulated) {
        console.log(`      ✅ Already populated`)
        continue
      }
      
      // Update the semi-final with the group winner
      const updateData = {}
      if (result.position === 'team1') {
        updateData.team1_id = result.winnerId
      } else {
        updateData.team2_id = result.winnerId
      }
      
      const { error } = await supabase
        .from('tournament_matches')
        .update(updateData)
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', result.advancesTo)
      
      if (error) {
        console.log(`      ❌ Error: ${error.message}`)
        errorCount++
      } else {
        console.log(`      ✅ Updated Semi-Final #${result.advancesTo}`)
        updateCount++
      }
    }
  } else {
    console.log('\nNo boys groups completed yet')
  }
  
  // Step 3: Show current tournament state
  console.log('\n📊 Current Tournament State')
  console.log('='.repeat(50))
  
  const { data: tomorrowMatches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
      team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 124)
    .lte('match_number', 129)
    .order('match_number')
  
  console.log('\nUpcoming Matches:')
  tomorrowMatches?.forEach(match => {
    const type = match.metadata?.type === 'semi_final' ? 'Semi-Final' : 
                 match.metadata?.type === 'final' ? 'Final' : 'Unknown'
    const division = match.metadata?.division || (match.match_number % 2 === 0 ? 'Girls' : 'Boys')
    
    console.log(`Match #${match.match_number} [${division} ${type}]:`)
    console.log(`   Team 1: ${match.team1?.team_name || 'TBD (awaiting winner)'}`)
    console.log(`   Team 2: ${match.team2?.team_name || 'TBD (awaiting winner)'}`)
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('AUTO-POPULATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully populated: ${updateCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  
  if (updateCount > 0) {
    console.log('\n🎉 Winners have been auto-populated to their next matches!')
  } else {
    console.log('\n💡 Complete more matches to see auto-population in action.')
  }
}

// Monitor mode for real-time progression
async function monitorAndPopulate() {
  console.log('🔄 Starting enhanced real-time winner progression monitor...\n')
  console.log('This will automatically populate winners as matches complete, including group stages.\n')
  
  // Run initial population
  await autoPopulateWinners()
  
  // Subscribe to match status changes
  const subscription = supabase
    .channel('enhanced-match-progression')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournament_matches',
        filter: `tournament_id=eq.${TOURNAMENT_ID}`
      },
      async (payload) => {
        if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
          console.log(`\n🏆 Match #${payload.new.match_number} just completed!`)
          
          // Wait a moment for winner_id to be set
          setTimeout(async () => {
            await autoPopulateWinners()
          }, 2000) // Increased timeout for group calculations
        }
      }
    )
    .subscribe()
  
  console.log('\n🔍 Enhanced monitor is running. Press Ctrl+C to stop.\n')
}

// Check if running in monitor mode
const isMonitorMode = process.argv.includes('--monitor')

if (isMonitorMode) {
  monitorAndPopulate()
} else {
  autoPopulateWinners()
    .then(() => {
      console.log('\n💡 Tip: Run with --monitor flag to continuously watch for completed matches')
      process.exit(0)
    })
    .catch(err => {
      console.error('Error:', err)
      process.exit(1)
    })
}