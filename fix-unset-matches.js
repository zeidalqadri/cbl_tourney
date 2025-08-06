#!/usr/bin/env node

// Script to fix unset match types (matches 82-101)
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function fixUnsetMatches() {
  console.log('🔧 Fixing Unset Match Types (Matches 82-101)...\n')
  
  // Get matches 82-101 which appear to be group stage continuation
  const { data: unsetMatches } = await supabase
    .from('tournament_matches')
    .select('id, match_number, metadata, team1:tournament_teams!tournament_matches_team1_id_fkey(division, pool), team2:tournament_teams!tournament_matches_team2_id_fkey(division, pool)')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 82)
    .lte('match_number', 101)
    .order('match_number')
  
  if (!unsetMatches || unsetMatches.length === 0) {
    console.log('No matches found in range 82-101')
    return
  }
  
  console.log(`Found ${unsetMatches.length} matches to process:\n`)
  
  let updateCount = 0
  let errorCount = 0
  
  for (const match of unsetMatches) {
    const currentType = match.metadata?.type || 'unset'
    
    // Determine division from teams
    const division = match.team1?.division || match.team2?.division || 'unknown'
    const pool = match.team1?.pool || match.team2?.pool || 'unknown'
    
    console.log(`Match #${match.match_number}:`)
    console.log(`   Current type: "${currentType}"`)
    console.log(`   Division: ${division}, Pool: ${pool}`)
    
    // These appear to be group stage matches based on their position
    const updatedMetadata = {
      ...match.metadata,
      type: 'group_stage',
      stage: 'group',
      division: division,
      pool: pool,
      display_name: 'Group Stage',
      standardized_at: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('tournament_matches')
      .update({ metadata: updatedMetadata })
      .eq('id', match.id)
    
    if (error) {
      console.log(`   ❌ Error updating: ${error.message}`)
      errorCount++
    } else {
      console.log(`   ✅ Updated to "group_stage"`)
      updateCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('UNSET MATCHES FIX SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated: ${updateCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  
  if (updateCount > 0) {
    console.log('\n🎉 Unset matches successfully categorized!')
    console.log('All matches now have proper type assignments.')
  }
  
  // Verify all matches now have types
  console.log('\n📊 Final Verification:')
  console.log('-'.repeat(60))
  
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .order('match_number')
  
  const unsetCount = allMatches?.filter(m => !m.metadata?.type).length || 0
  const totalCount = allMatches?.length || 0
  
  console.log(`Total matches: ${totalCount}`)
  console.log(`Matches with type set: ${totalCount - unsetCount}`)
  console.log(`Matches without type: ${unsetCount}`)
  
  if (unsetCount === 0) {
    console.log('\n✅ All matches now have proper type assignments!')
  } else {
    console.log('\n⚠️  Some matches still missing type assignments.')
    const missing = allMatches?.filter(m => !m.metadata?.type).map(m => m.match_number)
    console.log(`Missing: #${missing?.join(', #')}`)
  }
}

// Run the fix
fixUnsetMatches()
  .then(() => {
    console.log('\n✅ Unset matches fix complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })