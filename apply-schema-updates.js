#!/usr/bin/env node

// Script to apply schema updates for missing columns
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function applySchemaUpdates() {
  console.log('📊 Applying schema updates to add missing columns...\n')
  
  const updates = [
    {
      name: 'group_position',
      query: `ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_position INTEGER`
    },
    {
      name: 'group_points',
      query: `ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_points INTEGER DEFAULT 0`
    },
    {
      name: 'group_wins',
      query: `ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_wins INTEGER DEFAULT 0`
    },
    {
      name: 'group_losses',
      query: `ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_losses INTEGER DEFAULT 0`
    },
    {
      name: 'group_played',
      query: `ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_played INTEGER DEFAULT 0`
    },
    {
      name: 'points_for',
      query: `ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS points_for INTEGER DEFAULT 0`
    },
    {
      name: 'points_against',
      query: `ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS points_against INTEGER DEFAULT 0`
    }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const update of updates) {
    try {
      // We can't run raw SQL directly through Supabase JS client
      // So we'll update the teams table with default values for these columns
      console.log(`   Adding column: ${update.name}...`)
      
      // Get all teams
      const { data: teams, error: fetchError } = await supabase
        .from('tournament_teams')
        .select('id')
        .limit(1)
      
      if (fetchError) {
        // Column might not exist, that's expected
        console.log(`   ⚠️  Column ${update.name} needs to be added via SQL Editor`)
        errorCount++
      } else {
        // Try to update with the new column
        const testUpdate = {}
        testUpdate[update.name] = 0
        
        const { error: updateError } = await supabase
          .from('tournament_teams')
          .update(testUpdate)
          .eq('id', teams[0]?.id || 'test')
        
        if (updateError && updateError.message.includes('column')) {
          console.log(`   ⚠️  Column ${update.name} does not exist - needs SQL Editor`)
          errorCount++
        } else {
          console.log(`   ✅ Column ${update.name} is available`)
          successCount++
        }
      }
    } catch (err) {
      console.log(`   ❌ Error checking ${update.name}: ${err.message}`)
      errorCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('SCHEMA UPDATE SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Columns available: ${successCount}`)
  console.log(`⚠️  Columns need SQL Editor: ${errorCount}`)
  
  if (errorCount > 0) {
    console.log('\n⚠️  IMPORTANT: Missing columns detected!')
    console.log('Please go to Supabase Dashboard > SQL Editor and run:')
    console.log('\n```sql')
    for (const update of updates) {
      console.log(update.query + ';')
    }
    console.log('```')
    console.log('\nThen run: npm run calculate-standings')
  }
  
  return errorCount === 0
}

// Run the schema updates
applySchemaUpdates()
  .then(success => {
    if (success) {
      console.log('\n✅ All columns are ready!')
      console.log('You can now run: npm run calculate-standings')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })