import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tnglzpywvtafomngxsgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'
)

async function checkTables() {
  // Check tournament_matches
  const { data: tMatches, error: tError } = await supabase
    .from('tournament_matches')
    .select('*')
    .limit(1)
  
  if (tError) {
    console.log('tournament_matches error:', tError.message)
  } else {
    console.log('tournament_matches exists:', tMatches)
  }

  // Check matches
  const { data: matches, error: mError } = await supabase
    .from('matches')
    .select('*')
    .limit(1)
  
  if (mError) {
    console.log('matches error:', mError.message)
  } else {
    console.log('matches exists:', matches)
  }
}

checkTables().catch(console.error)