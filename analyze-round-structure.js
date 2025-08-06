#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function analyzeRoundStructure() {
  console.log('🔍 Analyzing Tournament Round Structure...\n')
  
  // Get all matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('match_number, round, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .order('match_number')
  
  // Group by round
  const roundGroups = {}
  matches?.forEach(match => {
    const round = match.round
    if (!roundGroups[round]) {
      roundGroups[round] = []
    }
    roundGroups[round].push(match)
  })
  
  console.log('Current Round Distribution:')
  console.log('='.repeat(70))
  
  Object.entries(roundGroups).forEach(([round, roundMatches]) => {
    const matchNumbers = roundMatches.map(m => m.match_number)
    const minMatch = Math.min(...matchNumbers)
    const maxMatch = Math.max(...matchNumbers)
    
    console.log(`\nRound ${round}: ${roundMatches.length} matches`)
    console.log(`  Range: Match #${minMatch} - #${maxMatch}`)
    
    // Check types in this round
    const types = {}
    roundMatches.forEach(match => {
      const type = match.metadata?.type || 'unset'
      types[type] = (types[type] || 0) + 1
    })
    
    console.log('  Types:')
    Object.entries(types).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count} matches`)
    })
    
    // Sample match numbers
    if (matchNumbers.length > 10) {
      console.log(`  Sample: #${matchNumbers.slice(0, 5).join(', #')}...`)
    } else {
      console.log(`  Matches: #${matchNumbers.join(', #')}`)
    }
  })
  
  console.log('\n' + '='.repeat(70))
  console.log('IDENTIFIED ISSUES:')
  console.log('='.repeat(70))
  
  console.log('\n1. Round numbering doesn\'t match tournament structure:')
  console.log('   - Group stage matches (1-45) are Round 1 ✅')
  console.log('   - Group stage continuation (46-81) are Round 2 ❌ (should be Round 1)')
  console.log('   - More group matches (82-101) are Round 2 ❌ (should be Round 1)')
  console.log('   - Quarter-finals/Second round (102-123) are Round 3 ❌ (should be Round 2)')
  console.log('   - Semi-finals (124-127) are Round 3 ❌ (should be Round 3)')
  console.log('   - Finals (128-129) are Round 4 ✅')
  
  console.log('\n2. Proposed fix:')
  console.log('   - All group stage matches (1-101) → Round 1')
  console.log('   - Quarter-finals & Second round (102-123) → Round 2')
  console.log('   - Semi-finals (124-127) → Round 3')
  console.log('   - Finals (128-129) → Round 4')
  
  return roundGroups
}

analyzeRoundStructure()
  .then(() => {
    console.log('\n✅ Analysis complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })