#!/usr/bin/env node

// Script to fix tournament round numbers for consistency
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Correct round structure
const ROUND_STRUCTURE = {
  1: {
    name: 'Group Stage',
    matchRanges: [
      { start: 1, end: 101 }  // All group stage matches
    ],
    description: 'All group stage matches'
  },
  2: {
    name: 'Knockout Round 1',
    matchRanges: [
      { start: 102, end: 123 }  // Quarter-finals (girls) and Second round (boys)
    ],
    description: 'Quarter-finals for girls, Second round groups for boys'
  },
  3: {
    name: 'Semi-Finals',
    matchRanges: [
      { start: 124, end: 127 }  // All semi-finals
    ],
    description: 'Semi-finals for both divisions'
  },
  4: {
    name: 'Finals',
    matchRanges: [
      { start: 128, end: 129 }  // Finals
    ],
    description: 'Finals for both divisions'
  }
}

async function fixRoundNumbers() {
  console.log('🔧 Fixing Tournament Round Numbers...\n')
  console.log('This will align round numbers with the actual tournament structure.\n')
  
  let totalUpdates = 0
  let totalErrors = 0
  
  for (const [roundNumber, roundData] of Object.entries(ROUND_STRUCTURE)) {
    console.log(`📊 Round ${roundNumber}: ${roundData.name}`)
    console.log(`   ${roundData.description}`)
    console.log('-'.repeat(70))
    
    for (const range of roundData.matchRanges) {
      // Get matches in this range
      const { data: matches, error: fetchError } = await supabase
        .from('tournament_matches')
        .select('id, match_number, round')
        .eq('tournament_id', TOURNAMENT_ID)
        .gte('match_number', range.start)
        .lte('match_number', range.end)
        .order('match_number')
      
      if (fetchError) {
        console.log(`   ❌ Error fetching matches ${range.start}-${range.end}: ${fetchError.message}`)
        totalErrors++
        continue
      }
      
      if (!matches || matches.length === 0) {
        console.log(`   ⚠️  No matches found in range ${range.start}-${range.end}`)
        continue
      }
      
      // Check which matches need updating
      const needsUpdate = matches.filter(m => m.round !== parseInt(roundNumber))
      const alreadyCorrect = matches.filter(m => m.round === parseInt(roundNumber))
      
      console.log(`   Range #${range.start}-#${range.end}: ${matches.length} matches`)
      console.log(`     - ${alreadyCorrect.length} already correct`)
      console.log(`     - ${needsUpdate.length} need updating`)
      
      if (needsUpdate.length === 0) {
        console.log(`     ✅ All matches already have correct round number`)
        continue
      }
      
      // Update matches that need it
      const matchIds = needsUpdate.map(m => m.id)
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({ round: parseInt(roundNumber) })
        .in('id', matchIds)
      
      if (updateError) {
        console.log(`     ❌ Error updating: ${updateError.message}`)
        totalErrors++
      } else {
        console.log(`     ✅ Updated ${needsUpdate.length} matches to Round ${roundNumber}`)
        totalUpdates += needsUpdate.length
      }
    }
    console.log()
  }
  
  console.log('='.repeat(70))
  console.log('ROUND NUMBER FIX SUMMARY')
  console.log('='.repeat(70))
  console.log(`✅ Successfully updated: ${totalUpdates} matches`)
  console.log(`❌ Errors encountered: ${totalErrors}`)
  
  if (totalUpdates > 0) {
    console.log('\n🎉 Round numbers successfully corrected!')
    console.log('Tournament structure is now consistent.')
  }
  
  // Verify the fix
  console.log('\n📋 Verification:')
  console.log('-'.repeat(70))
  
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, round, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .order('match_number')
  
  // Group by round for verification
  const roundGroups = {}
  allMatches?.forEach(match => {
    const round = match.round
    if (!roundGroups[round]) {
      roundGroups[round] = { matches: [], types: {} }
    }
    roundGroups[round].matches.push(match.match_number)
    
    const type = match.metadata?.type || 'unset'
    roundGroups[round].types[type] = (roundGroups[round].types[type] || 0) + 1
  })
  
  Object.entries(roundGroups).forEach(([round, data]) => {
    const minMatch = Math.min(...data.matches)
    const maxMatch = Math.max(...data.matches)
    console.log(`\nRound ${round}: ${data.matches.length} matches (#${minMatch}-#${maxMatch})`)
    
    Object.entries(data.types).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} matches`)
    })
  })
  
  return { totalUpdates, totalErrors }
}

// Validate round-type consistency after fix
async function validateRoundTypeConsistency() {
  console.log('\n\n🔍 Validating Round-Type Consistency...\n')
  
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('match_number, round, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .order('match_number')
  
  const expectedRounds = {
    'group_stage': 1,
    'quarter_final': 2,
    'second_round': 2,
    'semi_final': 3,
    'final': 4
  }
  
  const issues = []
  
  matches?.forEach(match => {
    const type = match.metadata?.type
    const round = match.round
    
    if (type && expectedRounds[type]) {
      const expected = expectedRounds[type]
      if (round !== expected) {
        issues.push(`Match #${match.match_number}: Type "${type}" is Round ${round} (expected Round ${expected})`)
      }
    }
  })
  
  if (issues.length === 0) {
    console.log('✅ All match types and rounds are consistent!')
  } else {
    console.log(`❌ Found ${issues.length} inconsistencies:`)
    issues.forEach(issue => console.log(`   ${issue}`))
  }
  
  return issues.length === 0
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixRoundNumbers()
    .then(() => validateRoundTypeConsistency())
    .then((isConsistent) => {
      console.log('\n' + '='.repeat(70))
      if (isConsistent) {
        console.log('✅ Round numbers fixed and validated successfully!')
        console.log('Tournament structure is now fully consistent.')
      } else {
        console.log('⚠️  Round numbers updated but some inconsistencies remain.')
        console.log('This may be due to unset match types.')
      }
      process.exit(0)
    })
    .catch(err => {
      console.error('Error:', err)
      process.exit(1)
    })
}

export { fixRoundNumbers, validateRoundTypeConsistency }