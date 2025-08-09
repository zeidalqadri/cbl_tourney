#!/usr/bin/env node

// Script to fix match status for matches with scores
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function fixMatchStatus() {
  console.log('🔧 Fixing Match Status for Scored Matches...\n')
  
  // Get all matches with scores but pending status
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(team_name), team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'pending')
    .not('score1', 'is', null)
    .not('score2', 'is', null)
  
  if (!matches || matches.length === 0) {
    console.log('No matches found with scores but pending status')
    return
  }
  
  console.log(`Found ${matches.length} matches to update:\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const match of matches) {
    const winner = match.score1 > match.score2 
      ? match.team1?.team_name 
      : match.score2 > match.score1 
        ? match.team2?.team_name
        : 'Tie'
    
    console.log(`   Match #${match.match_number}: ${match.team1?.team_name} (${match.score1}) vs ${match.team2?.team_name} (${match.score2})`)
    console.log(`      Winner: ${winner}`)
    
    // Update status to completed
    const { error } = await supabase
      .from('tournament_matches')
      .update({ 
        status: 'completed',
        winner_id: match.score1 > match.score2 
          ? match.team1_id 
          : match.score2 > match.score1 
            ? match.team2_id 
            : null
      })
      .eq('id', match.id)
    
    if (error) {
      console.log(`      ❌ Error: ${error.message}`)
      errorCount++
    } else {
      console.log(`      ✅ Status updated to completed`)
      successCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('UPDATE SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated: ${successCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  
  // Now verify the fix
  console.log('\n📊 Verifying Fix...\n')
  
  const { data: updatedMatches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(team_name), team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'completed')
    .gte('match_number', 102)
    .lte('match_number', 123)
    .order('match_number', { ascending: true })
  
  if (updatedMatches && updatedMatches.length > 0) {
    console.log('Completed Matches (should now show winner highlighting):')
    console.log('-'.repeat(60))
    updatedMatches.forEach(match => {
      const winner = match.score1 > match.score2 
        ? match.team1?.team_name 
        : match.team2?.team_name
      console.log(`   Match #${match.match_number}: ${winner} won (${match.score1}-${match.score2})`)
    })
  }
}

// Run the fix
fixMatchStatus()
  .then(() => {
    console.log('\n🎉 Match status fixed successfully!')
    console.log('Winner highlighting should now appear for all completed matches.')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })