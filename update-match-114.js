#!/usr/bin/env node

// Example script to update match #114 with 90-minute delay
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function updateMatch114() {
  console.log('📊 Updating Match #114 with 90-minute delay...\n')
  
  // Get current match details
  const { data: match, error: fetchError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('match_number', 114)
    .single()
  
  if (fetchError || !match) {
    console.error('Error fetching match:', fetchError)
    return
  }
  
  console.log('Current Match #114 Status:')
  console.log(`  Scheduled: ${new Date(match.scheduled_time).toLocaleString()}`)
  console.log(`  Status: ${match.status}`)
  console.log(`  Venue: ${match.venue}`)
  
  // Calculate new time with 90-minute delay
  const originalTime = new Date(match.scheduled_time)
  const actualStartTime = new Date(originalTime.getTime() + 90 * 60000) // Add 90 minutes
  
  console.log(`\nApplying 90-minute delay:`)
  console.log(`  New actual start: ${actualStartTime.toLocaleString()}`)
  
  // Update the match
  const updateData = {
    actual_start_time: actualStartTime.toISOString(),
    delay_minutes: 90,
    postponement_reason: 'Previous matches ran overtime',
    status: 'in_progress', // Mark as in progress since it's currently playing
    last_updated_by: 'admin',
    updated_at: new Date().toISOString()
  }
  
  const { error: updateError } = await supabase
    .from('tournament_matches')
    .update(updateData)
    .eq('id', match.id)
  
  if (updateError) {
    console.error('Error updating match:', updateError)
    return
  }
  
  console.log('\n✅ Match #114 updated successfully!')
  console.log('  - Delay recorded: 90 minutes')
  console.log('  - Status: in_progress')
  console.log('  - Reason: Previous matches ran overtime')
  
  // Update metadata to track the change
  const metadataUpdate = {
    ...match.metadata,
    delay_applied: true,
    delay_minutes: 90,
    delay_reason: 'Previous matches ran overtime',
    last_updated: new Date().toISOString(),
    updated_by: 'admin'
  }
  
  await supabase
    .from('tournament_matches')
    .update({ metadata: metadataUpdate })
    .eq('id', match.id)
  
  console.log('\nMatch management system is now tracking this delay.')
  console.log('The admin interface will show this information.')
}

updateMatch114()
  .then(() => {
    console.log('\n✅ Update complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })