#!/usr/bin/env node

// Script to fix girls match types from PQF to quarter_final
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function fixGirlsMatchTypes() {
  console.log('🔧 Fixing Girls Match Types (PQF → Quarter Final)...\n')
  
  // Get current girls quarter-final matches
  const { data: girlsMatches } = await supabase
    .from('tournament_matches')
    .select('id, match_number, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [102, 109, 116, 123])
    .order('match_number')
  
  if (!girlsMatches || girlsMatches.length === 0) {
    console.log('No girls quarter-final matches found')
    return
  }
  
  console.log(`Found ${girlsMatches.length} girls quarter-final matches to update:\n`)
  
  let updateCount = 0
  let errorCount = 0
  
  for (const match of girlsMatches) {
    const currentType = match.metadata?.type || 'Not set'
    console.log(`Match #${match.match_number}: Current type = "${currentType}"`)
    
    // Update metadata to use standard quarter_final type
    const updatedMetadata = {
      ...match.metadata,
      type: 'quarter_final',
      stage: 'knockout',
      division: 'girls'
    }
    
    const { error } = await supabase
      .from('tournament_matches')
      .update({ metadata: updatedMetadata })
      .eq('id', match.id)
    
    if (error) {
      console.log(`   ❌ Error updating match #${match.match_number}: ${error.message}`)
      errorCount++
    } else {
      console.log(`   ✅ Updated to "quarter_final"`)
      updateCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('GIRLS MATCH TYPE UPDATE SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated: ${updateCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  
  if (updateCount > 0) {
    console.log('\n🎉 Girls matches now properly labeled as Quarter Finals!')
    console.log('Frontend should now display correct match types.')
  }
  
  // Verify the updates
  console.log('\n📊 Verification:')
  console.log('-'.repeat(40))
  
  const { data: updatedMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [102, 109, 116, 123])
    .order('match_number')
  
  updatedMatches?.forEach(match => {
    const type = match.metadata?.type || 'Not set'
    console.log(`Match #${match.match_number}: ${type}`)
  })
}

// Run the fix
fixGirlsMatchTypes()
  .then(() => {
    console.log('\n✅ Girls match type fix complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })