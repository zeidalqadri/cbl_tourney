#!/usr/bin/env node

// Update match #114 using metadata field for tracking delays
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function updateMatch114WithMetadata() {
  console.log('📊 Updating Match #114 with 90-minute delay (using metadata)...\n')
  
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
  console.log(`  Original time: ${originalTime.toLocaleString()}`)
  console.log(`  Actual start: ${actualStartTime.toLocaleString()}`)
  
  // Update metadata to track all match management info
  const updatedMetadata = {
    ...match.metadata,
    // Time management
    actual_start_time: actualStartTime.toISOString(),
    delay_minutes: 90,
    postponement_reason: 'Previous matches ran overtime',
    
    // Officials (example)
    referee_name: null,
    scorer_name: null,
    photographer_assigned: null,
    
    // Change tracking
    last_updated: new Date().toISOString(),
    last_updated_by: 'admin',
    change_log: [
      ...(match.metadata?.change_log || []),
      {
        timestamp: new Date().toISOString(),
        user: 'admin',
        action: 'Applied 90-minute delay',
        changes: {
          delay_minutes: { old: 0, new: 90 },
          actual_start_time: { old: null, new: actualStartTime.toISOString() },
          status: { old: 'pending', new: 'in_progress' }
        }
      }
    ]
  }
  
  // Update the match
  const { error: updateError } = await supabase
    .from('tournament_matches')
    .update({
      status: 'in_progress', // Mark as currently playing
      metadata: updatedMetadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', match.id)
  
  if (updateError) {
    console.error('Error updating match:', updateError)
    return
  }
  
  console.log('\n✅ Match #114 updated successfully!')
  console.log('  - Delay recorded: 90 minutes')
  console.log('  - Status: in_progress')
  console.log('  - Reason: Previous matches ran overtime')
  console.log('  - Actual start time: ' + actualStartTime.toLocaleTimeString())
  
  console.log('\n📋 Match Management Info Stored in Metadata:')
  console.log('  - actual_start_time')
  console.log('  - delay_minutes')
  console.log('  - postponement_reason')
  console.log('  - change_log (audit trail)')
  
  console.log('\nThe admin interface can now read and display this information.')
}

updateMatch114WithMetadata()
  .then(() => {
    console.log('\n✅ Update complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })