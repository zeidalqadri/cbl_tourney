#!/usr/bin/env node

// Script to update boys second round matches with group metadata
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { BOYS_GROUPS } from './boys-group-standings.js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function updateBoysMatchMetadata() {
  console.log('🔧 Updating Boys Second Round Match Metadata...\n')
  
  let updateCount = 0
  let errorCount = 0
  
  for (const [groupName, groupData] of Object.entries(BOYS_GROUPS)) {
    console.log(`📊 Processing Group ${groupName}...`)
    
    for (const matchNumber of groupData.matches) {
      // Get current match data
      const { data: match, error: fetchError } = await supabase
        .from('tournament_matches')
        .select('metadata, advances_to_match_id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', matchNumber)
        .single()
      
      if (fetchError) {
        console.log(`   ❌ Error fetching match #${matchNumber}: ${fetchError.message}`)
        errorCount++
        continue
      }
      
      // Get the semi-final match ID for advancement
      const { data: semiFinalMatch } = await supabase
        .from('tournament_matches')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', groupData.advancesTo)
        .single()
      
      // Update metadata with group information
      const updatedMetadata = {
        ...match?.metadata,
        group: groupName,
        type: 'second_round',
        division: 'boys',
        advances_to: groupData.advancesTo,
        advances_to_position: groupData.position,
        group_teams: groupData.teams
      }
      
      const updates = {
        metadata: updatedMetadata
      }
      
      // Set advancement link if semi-final exists and not already set
      if (semiFinalMatch && !match?.advances_to_match_id) {
        updates.advances_to_match_id = semiFinalMatch.id
      }
      
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update(updates)
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', matchNumber)
      
      if (updateError) {
        console.log(`   ❌ Error updating match #${matchNumber}: ${updateError.message}`)
        errorCount++
      } else {
        console.log(`   ✅ Updated match #${matchNumber} (${groupName})`)
        updateCount++
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('METADATA UPDATE SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated: ${updateCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  
  if (updateCount > 0) {
    console.log('\n🎉 Boys match metadata updated successfully!')
    console.log('Matches now have group assignments and advancement links.')
  }
  
  // Verify the updates
  console.log('\n📊 Verification - Sample Updated Matches:')
  console.log('-'.repeat(60))
  
  const { data: sampleMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, metadata, advances_to_match_id')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [103, 108, 106, 104])
    .order('match_number')
  
  sampleMatches?.forEach(match => {
    const group = match.metadata?.group || 'Unknown'
    const hasAdvancement = match.advances_to_match_id ? '✅' : '❌'
    console.log(`   Match #${match.match_number}: Group ${group} ${hasAdvancement} Advancement Link`)
  })
}

// Run the update
updateBoysMatchMetadata()
  .then(() => {
    console.log('\n✅ Boys match metadata update complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })