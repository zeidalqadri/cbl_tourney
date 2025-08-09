import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

// Function to get team UUID by name and division
async function getTeamUuid(teamName, division) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('team_name', teamName)
    .eq('division', division)
    .single()
  
  if (error) {
    console.log(`❌ Error finding team "${teamName}" (${division}):`, error.message)
    return null
  }
  
  return data.id
}

console.log('Adding remaining matches...')

// First, let's add some key matches that we know the teams for
const matches = [
  // Match 25 onwards - using teams we know exist
  {
    match_number: 25,
    team1: 'RENDAH KG LAPAN',
    team2: 'TIANG DERAS',
    division: 'boys',
    time: '2025-08-04 12:00:00+08',
    venue: 'SJKC YU HWA'
  },
  {
    match_number: 26,
    team1: 'SG UDANG',
    team2: 'MACHAP UMBOO',
    division: 'boys', 
    time: '2025-08-04 12:00:00+08',
    venue: 'SJKC MALIM'
  },
  {
    match_number: 27,
    team1: 'MELAKA PINDAH',
    team2: 'AIR BARUK',
    division: 'boys',
    time: '2025-08-04 12:20:00+08',
    venue: 'SJKC YU HWA'
  },
  {
    match_number: 28,
    team1: 'PAY FONG 1',
    team2: 'KEH SENG',
    division: 'boys',
    time: '2025-08-04 12:20:00+08',
    venue: 'SJKC MALIM'
  },
  {
    match_number: 29,
    team1: 'LENDU',
    team2: 'PAY FONG 2',
    division: 'boys',
    time: '2025-08-04 12:40:00+08',
    venue: 'SJKC YU HWA'
  },
  {
    match_number: 30,
    team1: 'PAYA MENGKUANG',
    team2: 'PONDOK BATANG',
    division: 'boys',
    time: '2025-08-04 12:40:00+08', 
    venue: 'SJKC MALIM'
  }
]

let added = 0

for (const match of matches) {
  const team1Id = await getTeamUuid(match.team1, match.division)
  const team2Id = await getTeamUuid(match.team2, match.division)
  
  if (!team1Id || !team2Id) {
    console.log(`⚠️ Skipping match ${match.match_number}: Missing team(s)`)
    continue
  }
  
  const { error } = await supabase
    .from('tournament_matches')
    .insert({
      tournament_id: '66666666-6666-6666-6666-666666666666',
      round: 1,
      match_number: match.match_number,
      team1_id: team1Id,
      team2_id: team2Id,
      scheduled_time: match.time,
      venue: match.venue,
      status: 'pending'
    })
  
  if (error) {
    console.log(`❌ Error adding match ${match.match_number}:`, error.message)
  } else {
    console.log(`✅ Added match ${match.match_number}: ${match.team1} vs ${match.team2}`)
    added++
  }
}

console.log(`\n🎯 Added ${added} matches`)

// Check final count
const { count } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`📊 Total matches now: ${count}`)