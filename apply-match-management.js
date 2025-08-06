#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function applyMatchManagementSchema() {
  console.log('📊 Applying Match Management Schema Updates...\n')
  
  const updates = [
    {
      name: 'actual_start_time',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP'
    },
    {
      name: 'actual_end_time',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP'
    },
    {
      name: 'delay_minutes',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0'
    },
    {
      name: 'is_walkover',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS is_walkover BOOLEAN DEFAULT FALSE'
    },
    {
      name: 'postponement_reason',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS postponement_reason TEXT'
    },
    {
      name: 'referee_name',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS referee_name VARCHAR(255)'
    },
    {
      name: 'scorer_name',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS scorer_name VARCHAR(255)'
    },
    {
      name: 'photographer_assigned',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS photographer_assigned VARCHAR(255)'
    },
    {
      name: 'last_updated_by',
      sql: 'ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255)'
    },
    {
      name: 'change_log',
      sql: "ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS change_log JSONB DEFAULT '[]'::jsonb"
    }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  console.log('Adding new columns:')
  console.log('-'.repeat(60))
  
  for (const update of updates) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: update.sql })
      
      if (error) {
        console.log(`❌ ${update.name}: ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ ${update.name}: Added successfully`)
        successCount++
      }
    } catch (err) {
      console.log(`❌ ${update.name}: ${err.message}`)
      errorCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Schema Update Summary:')
  console.log(`✅ Success: ${successCount} columns`)
  console.log(`❌ Errors: ${errorCount} columns`)
  
  // Verify the columns exist
  console.log('\n📋 Verifying columns...')
  
  const { data: testMatch } = await supabase
    .from('tournament_matches')
    .select('*')
    .limit(1)
    .single()
  
  if (testMatch) {
    const newColumns = [
      'actual_start_time',
      'actual_end_time',
      'delay_minutes',
      'is_walkover',
      'postponement_reason',
      'referee_name',
      'scorer_name',
      'photographer_assigned',
      'last_updated_by',
      'change_log'
    ]
    
    const existingColumns = newColumns.filter(col => col in testMatch)
    console.log(`\nFound ${existingColumns.length}/${newColumns.length} new columns in database`)
    
    if (existingColumns.length === newColumns.length) {
      console.log('✅ All match management columns are ready!')
    } else {
      const missing = newColumns.filter(col => !(col in testMatch))
      console.log('⚠️  Missing columns:', missing.join(', '))
    }
  }
}

applyMatchManagementSchema()
  .then(() => {
    console.log('\n✅ Match management schema update complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })