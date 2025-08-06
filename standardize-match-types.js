#!/usr/bin/env node

// Script to standardize all tournament match types in database
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Comprehensive tournament structure mapping
const TOURNAMENT_STRUCTURE = {
  // Group Stage (Round 1)
  group_stage: {
    matchNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81],
    type: 'group_stage',
    stage: 'group',
    displayName: 'Group Stage'
  },
  
  // Girls Quarter Finals (today's knockout)
  girls_quarter_finals: {
    matchNumbers: [102, 109, 116, 123],
    type: 'quarter_final',
    stage: 'knockout',
    division: 'girls',
    displayName: 'Quarter Final'
  },
  
  // Boys Second Round Groups
  boys_second_round: {
    matchNumbers: [103, 104, 105, 106, 107, 108, 110, 111, 112, 113, 114, 115, 117, 118, 119, 120, 121, 122],
    type: 'second_round',
    stage: 'knockout',
    division: 'boys',
    displayName: 'Second Round'
  },
  
  // Semi Finals
  girls_semi_finals: {
    matchNumbers: [124, 126],
    type: 'semi_final',
    stage: 'knockout',
    division: 'girls',
    displayName: 'Semi Final'
  },
  
  boys_semi_finals: {
    matchNumbers: [125, 127],
    type: 'semi_final',
    stage: 'knockout',
    division: 'boys',
    displayName: 'Semi Final'
  },
  
  // Finals
  girls_final: {
    matchNumbers: [128],
    type: 'final',
    stage: 'knockout',
    division: 'girls',
    displayName: 'Final'
  },
  
  boys_final: {
    matchNumbers: [129],
    type: 'final',
    stage: 'knockout',
    division: 'boys',
    displayName: 'Final'
  }
}

async function standardizeMatchTypes() {
  console.log('📊 Standardizing All Tournament Match Types...\n')
  console.log('This will ensure consistent, database-driven match labeling.\n')
  
  let totalUpdates = 0
  let totalErrors = 0
  
  for (const [sectionName, sectionData] of Object.entries(TOURNAMENT_STRUCTURE)) {
    console.log(`🏀 Processing ${sectionData.displayName} (${sectionData.matchNumbers.length} matches)`)
    console.log('-'.repeat(60))
    
    let sectionUpdates = 0
    let sectionErrors = 0
    
    for (const matchNumber of sectionData.matchNumbers) {
      // Get current match
      const { data: match, error: fetchError } = await supabase
        .from('tournament_matches')
        .select('id, match_number, metadata, team1:tournament_teams!tournament_matches_team1_id_fkey(division), team2:tournament_teams!tournament_matches_team2_id_fkey(division)')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', matchNumber)
        .single()
      
      if (fetchError) {
        console.log(`   ⚠️  Match #${matchNumber}: Not found (${fetchError.message})`)
        continue
      }
      
      if (!match) {
        console.log(`   ⚠️  Match #${matchNumber}: Not found`)
        continue
      }
      
      // Determine division if not specified in structure
      let division = sectionData.division
      if (!division) {
        division = match.team1?.division || match.team2?.division || 'unknown'
      }
      
      // Build standardized metadata
      const standardizedMetadata = {
        ...match.metadata, // Preserve existing metadata
        type: sectionData.type,
        stage: sectionData.stage,
        division: division,
        display_name: sectionData.displayName,
        section: sectionName,
        standardized_at: new Date().toISOString()
      }
      
      // Check if update is needed
      const needsUpdate = 
        match.metadata?.type !== sectionData.type ||
        match.metadata?.stage !== sectionData.stage ||
        match.metadata?.division !== division ||
        !match.metadata?.standardized_at
      
      if (!needsUpdate) {
        console.log(`   ✅ Match #${matchNumber}: Already standardized`)
        continue
      }
      
      // Update the match
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({ metadata: standardizedMetadata })
        .eq('id', match.id)
      
      if (updateError) {
        console.log(`   ❌ Match #${matchNumber}: Error - ${updateError.message}`)
        sectionErrors++
        totalErrors++
      } else {
        console.log(`   ✅ Match #${matchNumber}: Updated to "${sectionData.type}"`)
        sectionUpdates++
        totalUpdates++
      }
    }
    
    console.log(`   Summary: ${sectionUpdates} updated, ${sectionErrors} errors\n`)
  }
  
  console.log('=' * 80)
  console.log('TOURNAMENT STANDARDIZATION SUMMARY')
  console.log('=' * 80)
  console.log(`✅ Total matches updated: ${totalUpdates}`)
  console.log(`❌ Total errors: ${totalErrors}`)
  
  if (totalUpdates > 0) {
    console.log('\n🎉 Tournament match types successfully standardized!')
    console.log('All matches now have consistent, database-driven type labels.')
  }
  
  // Generate verification report
  console.log('\n📋 Verification Report:')
  console.log('-'.repeat(60))
  
  const verificationQueries = [
    { label: 'Group Stage Matches', type: 'group_stage' },
    { label: 'Quarter Finals', type: 'quarter_final' },
    { label: 'Second Round', type: 'second_round' },
    { label: 'Semi Finals', type: 'semi_final' },
    { label: 'Finals', type: 'final' }
  ]
  
  for (const query of verificationQueries) {
    const { data: matches } = await supabase
      .from('tournament_matches')
      .select('match_number')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('metadata->>type', query.type)
      .order('match_number')
    
    const count = matches?.length || 0
    const matchNumbers = matches?.map(m => m.match_number).join(', ') || 'None'
    
    console.log(`${query.label}: ${count} matches ${count > 0 ? `(${matchNumbers})` : ''}`)
  }
  
  return { totalUpdates, totalErrors }
}

// Also create a function to validate match type consistency
async function validateMatchTypes() {
  console.log('\n🔍 Validating Match Type Consistency...\n')
  
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, metadata, round')
    .eq('tournament_id', TOURNAMENT_ID)
    .order('match_number')
  
  const issues = []
  
  allMatches?.forEach(match => {
    const type = match.metadata?.type
    const round = match.round
    const matchNum = match.match_number
    
    // Check for missing type
    if (!type) {
      issues.push(`Match #${matchNum}: Missing type (Round ${round})`)
      return
    }
    
    // Check for type/round consistency
    const expectedRoundByType = {
      'group_stage': 1,
      'quarter_final': 2,
      'second_round': 2,
      'semi_final': 3,
      'final': 4
    }
    
    const expectedRound = expectedRoundByType[type]
    if (expectedRound && expectedRound !== round) {
      issues.push(`Match #${matchNum}: Type "${type}" but Round ${round} (expected Round ${expectedRound})`)
    }
  })
  
  if (issues.length === 0) {
    console.log('✅ All match types are consistent!')
  } else {
    console.log(`❌ Found ${issues.length} consistency issues:`)
    issues.forEach(issue => console.log(`   ${issue}`))
  }
  
  return issues.length === 0
}

// Run the standardization
if (import.meta.url === `file://${process.argv[1]}`) {
  standardizeMatchTypes()
    .then(() => validateMatchTypes())
    .then((isConsistent) => {
      console.log('\n' + '='.repeat(60))
      if (isConsistent) {
        console.log('✅ Tournament match type standardization complete and validated!')
      } else {
        console.log('⚠️  Standardization complete but validation found issues.')
      }
      console.log('Database now serves as single source of truth for match types.')
      process.exit(0)
    })
    .catch(err => {
      console.error('Error:', err)
      process.exit(1)
    })
}

export { standardizeMatchTypes, validateMatchTypes, TOURNAMENT_STRUCTURE }