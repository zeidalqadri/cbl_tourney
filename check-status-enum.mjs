import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

// Check existing match statuses
const { data, error } = await supabase
  .from('tournament_matches')
  .select('status')
  .limit(10)

console.log('Sample statuses:', data?.map(m => m.status))