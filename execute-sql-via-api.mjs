import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 Adding display_name column...')

// Since we can't run ALTER TABLE directly through the client,
// let's check if we can work around this by using the column in our queries

// First, let's test if the column exists by trying to select it
const { data, error } = await supabase
  .from('tournament_teams')
  .select('id, display_name')
  .limit(1)

if (error && error.message.includes('display_name')) {
  console.log('❌ display_name column does not exist')
  console.log('\n📝 Please run the following SQL in your Supabase dashboard:')
  console.log('====================================================')
  console.log('ALTER TABLE tournament_teams')
  console.log('ADD COLUMN IF NOT EXISTS display_name TEXT;')
  console.log('====================================================')
  console.log('\nGo to: https://supabase.com/dashboard/project/tnglzpywvtafomngxsgc/editor')
  console.log('Click on "SQL Editor" and run the above command.')
} else {
  console.log('✅ display_name column already exists!')
}