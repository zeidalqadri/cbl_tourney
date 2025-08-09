import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🏀 Fixing and Loading Complete Tournament Schedule')
console.log('================================================\n')

// First, let's add missing girls teams with (G) suffix for co-ed schools
const girlsTeamsToAdd = [
  // Co-ed schools (add with (G) suffix)
  { name: 'YU HWA (G)', originalName: 'YU HWA', pool: 'PA' },
  { name: 'KEH SENG (G)', originalName: 'KEH SENG', pool: 'PA' },
  { name: 'PAY FONG 1 (G)', originalName: 'PAY FONG 1', pool: 'PA' },
  { name: 'SG UDANG (G)', originalName: 'SG UDANG', pool: 'PA' },
  { name: 'PAY CHIAO (G)', originalName: 'PAY CHIAO', pool: 'PA' },
  { name: 'YU HSIEN (G)', originalName: 'YU HSIEN', pool: 'PA' },
  { name: 'CHUNG HWA (G)', originalName: 'CHUNG HWA', pool: 'PB' },
  { name: 'PING MING (G)', originalName: 'PING MING', pool: 'PB' },
  { name: 'KUANG YAH (G)', originalName: 'KUANG YAH', pool: 'PB' },
  { name: 'BKT BERUANG (G)', originalName: 'BKT BERUANG', pool: 'PB' },
  { name: 'YU YING (G)', originalName: 'YU YING', pool: 'PB' },
  { name: 'PAY FONG 2 (G)', originalName: 'PAY FONG 2', pool: 'PB' },
  { name: 'CHABAU (G)', originalName: 'CHABAU', pool: 'PC' },
  { name: 'JASIN LALANG (G)', originalName: 'JASIN LALANG', pool: 'PC' },
  { name: 'PONDOK BATANG (G)', originalName: 'PONDOK BATANG', pool: 'PD' },
  { name: 'KIOW MIN (G)', originalName: 'KIOW MIN', pool: 'PD' },
  { name: 'SIN WAH (G)', originalName: 'SIN WAH', pool: 'PD' },
  { name: 'PAY TECK (G)', originalName: 'PAY TECK', pool: 'PD' },
  { name: 'WEN HUA (G)', originalName: 'WEN HUA', pool: 'PE' },
  { name: 'TIANG DUA (G)', originalName: 'TIANG DUA', pool: 'PE' },
  { name: 'PAY CHEE (G)', originalName: 'PAY CHEE', pool: 'PE' },
  { name: 'CHENG (G)', originalName: 'CHENG', pool: 'PF' },
  { name: 'MALIM (G)', originalName: 'MALIM', pool: 'PG' },
  { name: 'ALOR GAJAH (G)', originalName: 'ALOR GAJAH', pool: 'PG' },
  { name: 'PAY HWA (G)', originalName: 'PAY HWA', pool: 'PG' },
  { name: 'AYER KEROH (G)', originalName: 'AYER KEROH', pool: 'PG' },
  { name: 'POH LAN (G)', originalName: 'POH LAN', pool: 'PH' },
  { name: 'CHIAO CHEE (G)', originalName: 'CHIAO CHEE', pool: 'PH' },
  { name: 'MERLIMAU (G)', originalName: 'MERLIMAU', pool: 'PH' },
  { name: 'SHUH YEN (G)', originalName: 'SHUH YEN', pool: 'PH' },
  { name: 'MASJID TANAH (G)', originalName: 'MASJID TANAH', pool: 'PH' }
]

console.log('👧 Adding missing girls teams...')
let girlsAdded = 0

for (const team of girlsTeamsToAdd) {
  const { error } = await supabase
    .from('tournament_teams')
    .insert({
      tournament_id: '66666666-6666-6666-6666-666666666666',
      team_name: team.name,
      division: 'girls',
      pool: team.pool,
      coach: 'TBD',
      seed: 1,
      jersey_color: '#FF69B4', // Pink for girls
      stats: {},
      roster: [],
      metadata: { originalName: team.originalName }
    })
  
  if (error) {
    console.log(`❌ Error adding ${team.name}:`, error.message)
  } else {
    console.log(`✅ Added ${team.name} (Group ${team.pool})`)
    girlsAdded++
  }
}

console.log(`\n✅ Added ${girlsAdded} girls teams\n`)

// Function to get team UUID by name and division
async function getTeamUuid(teamName, division) {
  // For girls teams from co-ed schools, add (G) suffix
  let searchName = teamName
  if (division === 'girls') {
    // Check if this is a co-ed school name
    const { data: boysTeam } = await supabase
      .from('tournament_teams')
      .select('id')
      .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
      .eq('team_name', teamName)
      .eq('division', 'boys')
      .single()
    
    if (boysTeam) {
      // This is a co-ed school, use (G) suffix
      searchName = `${teamName} (G)`
    }
  }
  
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('team_name', searchName)
    .eq('division', division)
    .single()
  
  if (error) {
    console.log(`❌ Team not found: ${teamName} (${division})`)
    return null
  }
  
  return data.id
}

// Now load the remaining matches
const remainingMatches = [
  // Girls matches from Day 2 that failed
  { match_number: 51, team1: 'AYER KEROH', team2: 'POH LAN', division: 'girls', time: '2025-08-05 08:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 52, team1: 'YU HSIEN', team2: 'CHUNG HWA', division: 'girls', time: '2025-08-05 08:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 53, team1: 'PAY HWA', team2: 'MALIM', division: 'girls', time: '2025-08-05 08:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 54, team1: 'BKT BERUANG', team2: 'YU YING', division: 'girls', time: '2025-08-05 08:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 55, team1: 'TIANG DUA', team2: 'PAY CHEE', division: 'girls', time: '2025-08-05 08:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 56, team1: 'PAY FONG 2', team2: 'NOTRE DAME', division: 'girls', time: '2025-08-05 08:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 57, team1: 'CHENG', team2: 'KUANG HWA', division: 'girls', time: '2025-08-05 09:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 58, team1: 'CHABAU', team2: 'JASIN LALANG', division: 'girls', time: '2025-08-05 09:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 59, team1: 'CHIAO CHEE', team2: 'MERLIMAU', division: 'girls', time: '2025-08-05 09:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 60, team1: 'PONDOK BATANG', team2: 'YING CHYE', division: 'girls', time: '2025-08-05 09:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 61, team1: 'SHUH YEN', team2: 'MASJID TANAH', division: 'girls', time: '2025-08-05 09:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 62, team1: 'PING MING', team2: 'KUANG YAH', division: 'girls', time: '2025-08-05 09:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 63, team1: 'POH LAN', team2: 'PAY HWA', division: 'girls', time: '2025-08-05 10:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 64, team1: 'CHUNG HWA', team2: 'PAY CHIAO', division: 'girls', time: '2025-08-05 10:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 65, team1: 'MALIM', team2: 'ALOR GAJAH', division: 'girls', time: '2025-08-05 10:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 66, team1: 'YU HWA', team2: 'PAY FONG 1', division: 'girls', time: '2025-08-05 10:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 67, team1: 'PAY CHEE', team2: 'WEN HUA', division: 'girls', time: '2025-08-05 10:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 68, team1: 'YU YING', team2: 'PING MING', division: 'girls', time: '2025-08-05 10:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 69, team1: 'WEN HUA', team2: 'SIN WAH', division: 'girls', time: '2025-08-05 11:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 70, team1: 'BKT BERUANG', team2: 'PAY FONG 2', division: 'girls', time: '2025-08-05 11:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 71, team1: 'TIANG DUA', team2: 'PAY TECK', division: 'girls', time: '2025-08-05 11:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 72, team1: 'KUANG YAH', team2: 'CHUNG HWA', division: 'girls', time: '2025-08-05 11:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 73, team1: 'PAY CHEE', team2: 'CHENG', division: 'girls', time: '2025-08-05 11:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 74, team1: 'PAY FONG 1', team2: 'KEH SENG', division: 'girls', time: '2025-08-05 11:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 75, team1: 'ALOR GAJAH', team2: 'POH LAN', division: 'girls', time: '2025-08-05 12:00:00+08', venue: 'SJKC YU HWA' },
  
  // Continue with the remaining boys matches
  { match_number: 76, team1: 'MACHAP BARU', team2: 'DURIAN TUNGGAL', division: 'boys', time: '2025-08-05 12:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 77, team1: 'ST MARY', team2: 'PAYA RUMPUT', division: 'boys', time: '2025-08-05 12:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 78, team1: 'YU HSIEN', team2: 'TIANG DERAS', division: 'boys', time: '2025-08-05 12:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 79, team1: 'KIOW MIN', team2: 'MELAKA PINDAH', division: 'boys', time: '2025-08-05 12:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 80, team1: 'PAY HWA', team2: 'MALIM JAYA', division: 'boys', time: '2025-08-05 12:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 81, team1: 'EH HOCK', team2: 'MERLIMAU', division: 'boys', time: '2025-08-05 13:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 82, team1: 'DURIAN DAUN', team2: 'BACHANG', division: 'boys', time: '2025-08-05 13:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 83, team1: 'PAY CHUIN', team2: 'KATHOLIK', division: 'boys', time: '2025-08-05 13:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 84, team1: 'BKT BERUANG', team2: 'PAY TECK', division: 'boys', time: '2025-08-05 13:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 85, team1: 'KUANG YAH', team2: 'PAY FONG 2', division: 'boys', time: '2025-08-05 13:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 86, team1: 'JASIN', team2: 'JASIN LALANG', division: 'boys', time: '2025-08-05 13:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 87, team1: 'TEHEL', team2: 'ST MARY', division: 'boys', time: '2025-08-05 14:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 88, team1: 'SIN WAH', team2: 'PAY MIN', division: 'boys', time: '2025-08-05 14:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 89, team1: 'KATHOLIK', team2: 'YU HSIEN', division: 'boys', time: '2025-08-05 14:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 90, team1: 'PAY TECK', team2: 'KIOW MIN', division: 'boys', time: '2025-08-05 14:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 91, team1: 'MALIM JAYA', team2: 'KUANG YAH', division: 'boys', time: '2025-08-05 14:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 92, team1: 'JASIN LALANG', team2: 'EH HOCK', division: 'boys', time: '2025-08-05 14:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 93, team1: 'PAY MIN', team2: 'PAY CHIAO', division: 'boys', time: '2025-08-05 15:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 94, team1: 'BACHANG', team2: 'TEHEL', division: 'boys', time: '2025-08-05 15:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 95, team1: 'PAY CHUIN', team2: 'TIANG DERAS', division: 'boys', time: '2025-08-05 15:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 96, team1: 'PENGKALAN BALAK', team2: 'BKT BERUANG', division: 'boys', time: '2025-08-05 15:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 97, team1: 'PAY HWA', team2: 'LENDU', division: 'boys', time: '2025-08-05 15:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 98, team1: 'CHIAO CHEE', team2: 'MERLIMAU', division: 'boys', time: '2025-08-05 15:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 99, team1: 'PAY CHIAO', team2: 'SIN WAH', division: 'boys', time: '2025-08-05 16:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 100, team1: 'DURIAN DAUN', team2: 'ST MARY', division: 'boys', time: '2025-08-05 16:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 101, team1: 'RENDAH KG LAPAN', team2: 'YU HSIEN', division: 'boys', time: '2025-08-05 16:20:00+08', venue: 'SJKC YU HWA' }
]

console.log('📋 Loading remaining matches...')
let matchesAdded = 0

for (const match of remainingMatches) {
  const team1Id = await getTeamUuid(match.team1, match.division)
  const team2Id = await getTeamUuid(match.team2, match.division)
  
  if (!team1Id || !team2Id) {
    console.log(`⚠️ Skipping match ${match.match_number}: Missing teams`)
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
    console.log(`✅ Added match ${match.match_number}: ${match.team1} vs ${match.team2} (${match.division})`)
    matchesAdded++
  }
}

// Add knockout stage placeholder matches
const knockoutMatches = [
  // Boys Second Round (August 6)
  { match_number: 102, team1: null, team2: null, division: 'boys', time: '2025-08-06 08:00:00+08', venue: 'SJKC YU HWA', round: 2, metadata: { description: 'Boys Second Round 1' }},
  { match_number: 103, team1: null, team2: null, division: 'boys', time: '2025-08-06 08:20:00+08', venue: 'SJKC MALIM', round: 2, metadata: { description: 'Boys Second Round 2' }},
  { match_number: 104, team1: null, team2: null, division: 'boys', time: '2025-08-06 08:40:00+08', venue: 'SJKC YU HWA', round: 2, metadata: { description: 'Boys Second Round 3' }},
  { match_number: 105, team1: null, team2: null, division: 'boys', time: '2025-08-06 09:00:00+08', venue: 'SJKC MALIM', round: 2, metadata: { description: 'Boys Second Round 4' }},
  { match_number: 106, team1: null, team2: null, division: 'boys', time: '2025-08-06 09:20:00+08', venue: 'SJKC YU HWA', round: 2, metadata: { description: 'Boys Second Round 5' }},
  { match_number: 107, team1: null, team2: null, division: 'boys', time: '2025-08-06 09:40:00+08', venue: 'SJKC MALIM', round: 2, metadata: { description: 'Boys Second Round 6' }},
  { match_number: 108, team1: null, team2: null, division: 'boys', time: '2025-08-06 10:00:00+08', venue: 'SJKC YU HWA', round: 2, metadata: { description: 'Boys Second Round 7' }},
  { match_number: 109, team1: null, team2: null, division: 'boys', time: '2025-08-06 10:20:00+08', venue: 'SJKC MALIM', round: 2, metadata: { description: 'Boys Second Round 8' }},
  
  // Girls Quarter Finals (August 6)
  { match_number: 110, team1: null, team2: null, division: 'girls', time: '2025-08-06 10:40:00+08', venue: 'SJKC YU HWA', round: 3, metadata: { description: 'Girls Quarter Final 1' }},
  { match_number: 111, team1: null, team2: null, division: 'girls', time: '2025-08-06 11:00:00+08', venue: 'SJKC MALIM', round: 3, metadata: { description: 'Girls Quarter Final 2' }},
  { match_number: 112, team1: null, team2: null, division: 'girls', time: '2025-08-06 11:20:00+08', venue: 'SJKC YU HWA', round: 3, metadata: { description: 'Girls Quarter Final 3' }},
  { match_number: 113, team1: null, team2: null, division: 'girls', time: '2025-08-06 11:40:00+08', venue: 'SJKC MALIM', round: 3, metadata: { description: 'Girls Quarter Final 4' }},
  { match_number: 114, team1: null, team2: null, division: 'girls', time: '2025-08-06 12:00:00+08', venue: 'SJKC YU HWA', round: 3, metadata: { description: 'Girls Quarter Final 5' }},
  { match_number: 115, team1: null, team2: null, division: 'girls', time: '2025-08-06 12:20:00+08', venue: 'SJKC MALIM', round: 3, metadata: { description: 'Girls Quarter Final 6' }},
  { match_number: 116, team1: null, team2: null, division: 'girls', time: '2025-08-06 12:40:00+08', venue: 'SJKC YU HWA', round: 3, metadata: { description: 'Girls Quarter Final 7' }},
  { match_number: 117, team1: null, team2: null, division: 'girls', time: '2025-08-06 13:00:00+08', venue: 'SJKC MALIM', round: 3, metadata: { description: 'Girls Quarter Final 8' }},
  
  // Boys Semi Finals (August 7)
  { match_number: 118, team1: null, team2: null, division: 'boys', time: '2025-08-07 08:00:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Boys Semi Final 1' }},
  { match_number: 119, team1: null, team2: null, division: 'boys', time: '2025-08-07 08:20:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Boys Semi Final 2' }},
  
  // Girls Semi Finals (August 7)
  { match_number: 120, team1: null, team2: null, division: 'girls', time: '2025-08-07 08:40:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 1' }},
  { match_number: 121, team1: null, team2: null, division: 'girls', time: '2025-08-07 09:00:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 2' }},
  { match_number: 122, team1: null, team2: null, division: 'girls', time: '2025-08-07 09:20:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 3' }},
  { match_number: 123, team1: null, team2: null, division: 'girls', time: '2025-08-07 09:40:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 4' }},
  
  // 3rd/4th Place & Finals (August 7)
  { match_number: 124, team1: null, team2: null, division: 'boys', time: '2025-08-07 10:00:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Boys 3rd/4th Place' }},
  { match_number: 125, team1: null, team2: null, division: 'girls', time: '2025-08-07 10:20:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls 3rd/4th Place 1' }},
  { match_number: 126, team1: null, team2: null, division: 'girls', time: '2025-08-07 10:40:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls 3rd/4th Place 2' }},
  { match_number: 127, team1: null, team2: null, division: 'boys', time: '2025-08-07 11:00:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Boys Final' }},
  { match_number: 128, team1: null, team2: null, division: 'girls', time: '2025-08-07 11:20:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls Final 1' }},
  { match_number: 129, team1: null, team2: null, division: 'girls', time: '2025-08-07 11:40:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls Final 2' }}
]

console.log('\n🏆 Adding knockout stage placeholder matches...')
let knockoutAdded = 0

for (const match of knockoutMatches) {
  const { error } = await supabase
    .from('tournament_matches')
    .insert({
      tournament_id: '66666666-6666-6666-6666-666666666666',
      round: match.round,
      match_number: match.match_number,
      team1_id: match.team1,
      team2_id: match.team2,
      scheduled_time: match.time,
      venue: match.venue,
      status: 'pending',
      metadata: match.metadata || {}
    })
  
  if (error) {
    console.log(`❌ Error adding knockout match ${match.match_number}:`, error.message)
  } else {
    console.log(`✅ Added ${match.metadata.description}`)
    knockoutAdded++
  }
}

// Final count
const { count: finalCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`\n🎯 Final Summary:`)
console.log(`📊 Girls teams added: ${girlsAdded}`)
console.log(`📋 Group stage matches added: ${matchesAdded}`)
console.log(`🏆 Knockout matches added: ${knockoutAdded}`)
console.log(`📈 Total matches now: ${finalCount}/129`)

if (finalCount === 129) {
  console.log(`\n🏀 SUCCESS! Complete tournament schedule loaded!`)
  console.log(`🎮 MSS Melaka 2025 Basketball Tournament is ready!`)
} else {
  console.log(`\n⚠️ Still missing ${129 - finalCount} matches`)
}