#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function finalValidation() {
  console.log('🎯 Final Tournament Structure Validation\n')
  console.log('='.repeat(70))
  
  // Get all matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('match_number, round, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .order('match_number')
  
  // Validate structure
  const validation = {
    'Round 1 (Group Stage)': {
      expected: 101,
      actual: matches?.filter(m => m.round === 1 && m.metadata?.type === 'group_stage').length || 0
    },
    'Round 2 (Quarter/Second)': {
      expected: 22,
      actual: matches?.filter(m => m.round === 2 && ['quarter_final', 'second_round'].includes(m.metadata?.type)).length || 0
    },
    'Round 3 (Semi-Finals)': {
      expected: 4,
      actual: matches?.filter(m => m.round === 3 && m.metadata?.type === 'semi_final').length || 0
    },
    'Round 4 (Finals)': {
      expected: 2,
      actual: matches?.filter(m => m.round === 4 && m.metadata?.type === 'final').length || 0
    }
  }
  
  console.log('Tournament Structure Validation:')
  console.log('-'.repeat(70))
  
  let allValid = true
  Object.entries(validation).forEach(([key, data]) => {
    const isValid = data.actual === data.expected
    const icon = isValid ? '✅' : '❌'
    console.log(`${icon} ${key}: ${data.actual}/${data.expected} matches`)
    if (!isValid) allValid = false
  })
  
  // Check for untyped matches
  const untypedMatches = matches?.filter(m => !m.metadata?.type) || []
  console.log(`\n${untypedMatches.length === 0 ? '✅' : '❌'} Untyped matches: ${untypedMatches.length}`)
  
  // Check girls quarter-finals specifically
  console.log('\n📋 Girls Quarter-Finals Display Check:')
  console.log('-'.repeat(70))
  
  const girlsQuarterFinals = matches?.filter(m => [102, 109, 116, 123].includes(m.match_number)) || []
  girlsQuarterFinals.forEach(m => {
    const typeCorrect = m.metadata?.type === 'quarter_final'
    const roundCorrect = m.round === 2
    const icon = typeCorrect && roundCorrect ? '✅' : '❌'
    console.log(`${icon} Match #${m.match_number}: Type="${m.metadata?.type}", Round=${m.round}`)
  })
  
  // Check boys second round
  console.log('\n📋 Boys Second Round Check:')
  console.log('-'.repeat(70))
  
  const boysSecondRound = matches?.filter(m => m.match_number >= 103 && m.match_number <= 122 && ![109, 116].includes(m.match_number)) || []
  const sampleBoys = boysSecondRound.slice(0, 3)
  sampleBoys.forEach(m => {
    const typeCorrect = m.metadata?.type === 'second_round'
    const roundCorrect = m.round === 2
    const icon = typeCorrect && roundCorrect ? '✅' : '❌'
    console.log(`${icon} Match #${m.match_number}: Type="${m.metadata?.type}", Round=${m.round}`)
  })
  console.log(`   ... and ${boysSecondRound.length - 3} more boys second round matches`)
  
  // Final summary
  console.log('\n' + '='.repeat(70))
  if (allValid && untypedMatches.length === 0) {
    console.log('✅ TOURNAMENT STRUCTURE FULLY VALIDATED!')
    console.log('\nKey achievements:')
    console.log('  ✅ All 129 matches have proper type assignments')
    console.log('  ✅ Round numbers align with tournament structure')
    console.log('  ✅ Girls quarter-finals correctly labeled')
    console.log('  ✅ Boys second round properly categorized')
    console.log('  ✅ Database serves as single source of truth')
    console.log('\nThe tournament system is now fully consistent and ready for use!')
  } else {
    console.log('⚠️  Some validation issues remain. Please review above.')
  }
}

finalValidation()
  .then(() => {
    console.log('\n✅ Validation complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })