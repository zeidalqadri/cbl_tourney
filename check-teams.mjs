import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('📋 Checking teams in database...\n')

// Get all teams
const { data: teams, error } = await supabase
  .from('tournament_teams')
  .select('team_name, division, pool')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('division')
  .order('team_name')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`Total teams: ${teams.length}\n`)

const boyTeams = teams.filter(t => t.division === 'boys')
const girlTeams = teams.filter(t => t.division === 'girls')

console.log(`👦 Boys teams (${boyTeams.length}):`)
boyTeams.forEach((team, i) => {
  console.log(`${String(i + 1).padStart(2, ' ')}. ${team.team_name} (Group ${team.pool})`)
})

console.log(`\n👧 Girls teams (${girlTeams.length}):`)
girlTeams.forEach((team, i) => {
  console.log(`${String(i + 1).padStart(2, ' ')}. ${team.team_name} (Group ${team.pool})`)
})

// Check for duplicate team names
const duplicates = teams.reduce((acc, team) => {
  const key = `${team.team_name}_${team.division}`
  if (acc[key]) {
    acc[key].push(team)
  } else {
    acc[key] = [team]
  }
  return acc
}, {})

const duplicateEntries = Object.entries(duplicates).filter(([key, teams]) => teams.length > 1)

if (duplicateEntries.length > 0) {
  console.log(`\n⚠️ Duplicate team entries found:`)
  duplicateEntries.forEach(([key, teams]) => {
    console.log(`${key}: ${teams.length} entries`)
  })
}

// Check current match count
const { count: matchCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`\n📊 Current matches: ${matchCount}/129`)