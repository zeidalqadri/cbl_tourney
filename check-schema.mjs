import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

// Check for duplicate team names
const { data: teams, error } = await supabase
  .from('tournament_teams')
  .select('id, team_name, division')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('team_name')

if (error) {
  console.error('Error:', error)
} else {
  // Group by team name to find duplicates
  const teamsByName = {}
  teams.forEach(team => {
    if (!teamsByName[team.team_name]) {
      teamsByName[team.team_name] = []
    }
    teamsByName[team.team_name].push(team)
  })
  
  console.log('Teams that appear in multiple divisions:')
  Object.entries(teamsByName).forEach(([name, teams]) => {
    if (teams.length > 1) {
      console.log(`\n${name}:`)
      teams.forEach(t => console.log(`  - ${t.division} (${t.id})`))
    }
  })
}