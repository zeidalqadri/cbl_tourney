#!/usr/bin/env node

// Script to automatically populate winners to their next matches
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function autoPopulateWinners() {
  console.log('🏆 Auto-Populating Tournament Winners...\n')
  
  // Get all completed matches with progression links
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
  
  if (!completedMatches || completedMatches.length === 0) {
    console.log('No completed matches with progression links found')
    return
  }
  
  console.log(`Found ${completedMatches.length} completed matches with progression links\n`)
  
  let updateCount = 0
  let errorCount = 0
  
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
  
  // Check current state of tomorrow's matches
  console.log('\n📊 Tomorrow\'s Matches Status:')
  console.log('='.repeat(60))
  
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
  
  tomorrowMatches?.forEach(match => {
    const type = match.metadata?.type === 'semi_final' ? 'Semi-Final' : 
                 match.metadata?.type === 'final' ? 'Final' : 'Unknown'
    const division = match.match_number % 2 === 0 ? 'Girls' : 'Boys'
    
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

// Also create a real-time monitor that can be run continuously
async function monitorAndPopulate() {
  console.log('🔄 Starting real-time winner progression monitor...\n')
  console.log('This will automatically populate winners as matches complete.\n')
  
  // Subscribe to match status changes
  const subscription = supabase
    .channel('match-progression')
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
          }, 1000)
        }
      }
    )
    .subscribe()
  
  console.log('Monitor is running. Press Ctrl+C to stop.\n')
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