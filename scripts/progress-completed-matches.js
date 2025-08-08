#!/usr/bin/env node

/**
 * Script to fix matches that have scores but are still marked as pending
 * and progress winners to the next round
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixPendingMatchesWithScores() {
  console.log('🔍 Checking for matches with scores but pending status...\n')
  
  // Get all matches that have scores but are still pending
  const { data: matches, error } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'pending')
    .or('score1.gt.0,score2.gt.0')
    .order('match_number')
  
  if (error) {
    console.error('Error fetching matches:', error)
    return
  }
  
  const matchesToFix = matches?.filter(m => 
    (m.score1 !== null && m.score1 !== 0) || 
    (m.score2 !== null && m.score2 !== 0)
  ) || []
  
  if (matchesToFix.length === 0) {
    console.log('✅ No pending matches with scores found.')
  } else {
    console.log(`Found ${matchesToFix.length} matches to fix:\n`)
    
    for (const match of matchesToFix) {
      console.log(`Match #${match.match_number}: ${match.team1?.team_name || 'TBD'} (${match.score1}) vs ${match.team2?.team_name || 'TBD'} (${match.score2})`)
      
      // Determine winner
      let winnerId = null
      if (match.score1 > match.score2 && match.team1_id) {
        winnerId = match.team1_id
      } else if (match.score2 > match.score1 && match.team2_id) {
        winnerId = match.team2_id
      }
      
      // Update match status and winner
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({
          status: 'completed',
          winner_id: winnerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', match.id)
      
      if (updateError) {
        console.error(`  ❌ Error updating match: ${updateError.message}`)
      } else {
        const winnerName = winnerId === match.team1_id ? match.team1?.team_name : match.team2?.team_name
        console.log(`  ✅ Fixed: Status → completed, Winner → ${winnerName || 'Draw'}`)
      }
    }
  }
}

async function progressWinnersToNextRound() {
  console.log('\n🏆 Progressing winners to next rounds...\n')
  
  // Get all completed matches that should progress
  const { data: completedMatches, error } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'completed')
    .gte('round', 2) // Knockout rounds only
    .lt('round', 4) // Not finals
    .not('winner_id', 'is', null)
    .order('round')
    .order('match_number')
  
  if (error) {
    console.error('Error fetching completed matches:', error)
    return
  }
  
  for (const match of completedMatches || []) {
    const winner = match.winner_id === match.team1_id ? match.team1 : match.team2
    if (!winner) continue
    
    // Determine next round and match type
    let nextRound, nextMatchType
    
    if (match.metadata?.type === 'second_round' || (match.round === 2 && match.metadata?.division === 'boys')) {
      nextRound = 3
      nextMatchType = 'semi_final'
    } else if (match.metadata?.type === 'quarter_final' || (match.round === 2 && match.metadata?.division === 'girls')) {
      nextRound = 3
      nextMatchType = 'semi_final'
    } else if (match.metadata?.type === 'semi_final' || match.round === 3) {
      nextRound = 4
      nextMatchType = 'final'
    } else {
      continue // Skip if we can't determine progression
    }
    
    // Find next match that needs this winner
    const { data: nextMatches } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('round', nextRound)
      .eq('metadata->>type', nextMatchType)
      .eq('metadata->>division', match.metadata?.division || winner.division)
      .or('team1_id.is.null,team2_id.is.null')
    
    if (nextMatches && nextMatches.length > 0) {
      // Find the first available slot
      for (const nextMatch of nextMatches) {
        let updated = false
        
        if (!nextMatch.team1_id) {
          const { error: updateError } = await supabase
            .from('tournament_matches')
            .update({
              team1_id: winner.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', nextMatch.id)
          
          if (!updateError) {
            console.log(`✅ Match #${match.match_number}: ${winner.team_name} advances to Match #${nextMatch.match_number} (${nextMatchType})`)
            updated = true
          }
        } else if (!nextMatch.team2_id) {
          const { error: updateError } = await supabase
            .from('tournament_matches')
            .update({
              team2_id: winner.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', nextMatch.id)
          
          if (!updateError) {
            console.log(`✅ Match #${match.match_number}: ${winner.team_name} advances to Match #${nextMatch.match_number} (${nextMatchType})`)
            updated = true
          }
        }
        
        if (updated) break
      }
    }
  }
}

async function showCurrentStatus() {
  console.log('\n📊 Current Tournament Status:\n')
  
  // Get all knockout matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('round', 2)
    .order('round')
    .order('match_number')
  
  const rounds = {
    2: 'Second Round/Quarter Finals',
    3: 'Semi Finals',
    4: 'Finals'
  }
  
  let currentRound = 0
  for (const match of matches || []) {
    if (match.round !== currentRound) {
      currentRound = match.round
      console.log(`\n${rounds[currentRound]}:`)
      console.log('─'.repeat(40))
    }
    
    const team1 = match.team1?.team_name || 'Awaiting Team'
    const team2 = match.team2?.team_name || 'Awaiting Team'
    const score = match.status === 'completed' ? 
      ` [${match.score1}-${match.score2}]` : ''
    const status = match.status === 'completed' ? '✅' : '⏳'
    
    console.log(`${status} Match #${match.match_number}: ${team1} vs ${team2}${score}`)
  }
}

async function simulateScoresForTesting() {
  console.log('\n🎮 SIMULATION MODE: Adding test scores to semi-finals...\n')
  
  const testScores = [
    { matchNumber: 124, score1: 45, score2: 38 }, // KEH SENG (G) wins
    { matchNumber: 125, score1: 52, score2: 48 }, // MALIM (B) wins
    { matchNumber: 127, score1: 41, score2: 50 }  // ALOR GAJAH (B) wins
  ]
  
  for (const test of testScores) {
    const { data: match } = await supabase
      .from('tournament_matches')
      .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('match_number', test.matchNumber)
      .single()
    
    if (match && match.status === 'pending') {
      const winnerId = test.score1 > test.score2 ? match.team1_id : match.team2_id
      const winnerName = test.score1 > test.score2 ? match.team1?.team_name : match.team2?.team_name
      
      const { error } = await supabase
        .from('tournament_matches')
        .update({
          score1: test.score1,
          score2: test.score2,
          status: 'completed',
          winner_id: winnerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', match.id)
      
      if (!error) {
        console.log(`✅ Match #${test.matchNumber}: Set score ${test.score1}-${test.score2}, Winner: ${winnerName}`)
      }
    }
  }
}

// Main execution
async function main() {
  console.log('🏀 Tournament Match Progression Fixer\n')
  console.log('=====================================\n')
  
  // Check if simulation mode is requested
  const isSimulation = process.argv.includes('--simulate')
  
  if (isSimulation) {
    await simulateScoresForTesting()
  }
  
  // Fix any pending matches with scores
  await fixPendingMatchesWithScores()
  
  // Progress winners to next rounds
  await progressWinnersToNextRound()
  
  // Show current status
  await showCurrentStatus()
  
  console.log('\n✨ Done!')
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err)
  process.exit(1)
})