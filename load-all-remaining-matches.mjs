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

// All remaining matches from PDF schedule (continuing from match 31)
const allMatches = [
  // Day 1 continues - Boys Group Stage
  { match_number: 31, team1: 'TIANG DERAS', team2: 'BANDA KABA', division: 'boys', time: '2025-08-04 13:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 32, team1: 'POH LAN', team2: 'CHABAU', division: 'boys', time: '2025-08-04 13:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 33, team1: 'AIR BARUK', team2: 'PENGKALAN BALAK', division: 'boys', time: '2025-08-04 13:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 34, team1: 'MACHAP UMBOO', team2: 'DURIAN TUNGGAL', division: 'boys', time: '2025-08-04 13:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 35, team1: 'PAY FONG 2', team2: 'MALIM JAYA', division: 'boys', time: '2025-08-04 13:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 36, team1: 'KEH SENG', team2: 'DUYONG', division: 'boys', time: '2025-08-04 13:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 37, team1: 'BANDA KABA', team2: 'RENDAH KG LAPAN', division: 'boys', time: '2025-08-04 14:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 38, team1: 'PONDOK BATANG', team2: 'AIR KEROH', division: 'boys', time: '2025-08-04 14:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 39, team1: 'PENGKALAN BALAK', team2: 'MELAKA PINDAH', division: 'boys', time: '2025-08-04 14:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 40, team1: 'CHABAU', team2: 'MACHAP', division: 'boys', time: '2025-08-04 14:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 41, team1: 'MALIM JAYA', team2: 'LENDU', division: 'boys', time: '2025-08-04 14:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 42, team1: 'DURIAN TUNGGAL', team2: 'SG UDANG', division: 'boys', time: '2025-08-04 14:40:00+08', venue: 'SJKC MALIM' },

  // Day 2: August 5, 2025 - Boys continue + Girls start
  { match_number: 43, team1: 'DUYONG', team2: 'PAY FONG 1', division: 'boys', time: '2025-08-05 08:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 44, team1: 'SEMABOK', team2: 'AIR KEROH', division: 'girls', time: '2025-08-05 08:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 45, team1: 'AIR KEROH', team2: 'PAYA MENGKUANG', division: 'boys', time: '2025-08-05 08:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 46, team1: 'PAY FONG 1', team2: 'PAYA MENGKUANG', division: 'girls', time: '2025-08-05 08:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 47, team1: 'MACHAP', team2: 'POH LAN', division: 'boys', time: '2025-08-05 08:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 48, team1: 'AIR KEROH', team2: 'SG UDANG', division: 'girls', time: '2025-08-05 08:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 49, team1: 'RENDAH KG LAPAN', team2: 'LENDU', division: 'girls', time: '2025-08-05 09:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 50, team1: 'PAYA MENGKUANG', team2: 'PENGKALAN BALAK', division: 'girls', time: '2025-08-05 09:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 51, team1: 'PAY FONG 2', team2: 'PONDOK BATANG', division: 'girls', time: '2025-08-05 09:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 52, team1: 'SG UDANG', team2: 'SEMABOK', division: 'girls', time: '2025-08-05 09:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 53, team1: 'LENDU', team2: 'BANDA KABA', division: 'girls', time: '2025-08-05 09:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 54, team1: 'PENGKALAN BALAK', team2: 'PAY FONG 1', division: 'girls', time: '2025-08-05 09:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 55, team1: 'PONDOK BATANG', team2: 'MELAKA PINDAH', division: 'girls', time: '2025-08-05 10:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 56, team1: 'TIANG DERAS', team2: 'MACHAP UMBOO', division: 'girls', time: '2025-08-05 10:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 57, team1: 'BANDA KABA', team2: 'RENDAH KG LAPAN', division: 'girls', time: '2025-08-05 10:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 58, team1: 'CHABAU', team2: 'MACHAP', division: 'girls', time: '2025-08-05 10:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 59, team1: 'MELAKA PINDAH', team2: 'PAY FONG 2', division: 'girls', time: '2025-08-05 10:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 60, team1: 'MACHAP UMBOO', team2: 'MALIM JAYA', division: 'girls', time: '2025-08-05 10:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 61, team1: 'MACHAP', team2: 'KEH SENG', division: 'girls', time: '2025-08-05 11:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 62, team1: 'AIR BARUK', team2: 'DURIAN TUNGGAL', division: 'girls', time: '2025-08-05 11:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 63, team1: 'MALIM JAYA', team2: 'TIANG DERAS', division: 'girls', time: '2025-08-05 11:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 64, team1: 'POH LAN', team2: 'DUYONG', division: 'girls', time: '2025-08-05 11:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 65, team1: 'KEH SENG', team2: 'CHABAU', division: 'girls', time: '2025-08-05 11:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 66, team1: 'DURIAN TUNGGAL', team2: 'BANDA HILIR', division: 'girls', time: '2025-08-05 11:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 67, team1: 'DUYONG', team2: 'YONG PENG', division: 'girls', time: '2025-08-05 12:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 68, team1: 'SIN HOCK', team2: 'PU TIAN', division: 'girls', time: '2025-08-05 12:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 69, team1: 'BANDA HILIR', team2: 'AIR BARUK', division: 'girls', time: '2025-08-05 12:20:00+08', venue: 'SJKC YU HWA' },
  { match_number: 70, team1: 'PAYA RUMPUT', team2: 'CHUNG WEI', division: 'girls', time: '2025-08-05 12:20:00+08', venue: 'SJKC MALIM' },
  { match_number: 71, team1: 'YONG PENG', team2: 'POH LAN', division: 'girls', time: '2025-08-05 12:40:00+08', venue: 'SJKC YU HWA' },
  { match_number: 72, team1: 'PU TIAN', team2: 'ANN TING', division: 'girls', time: '2025-08-05 12:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 73, team1: 'CHUNG WEI', team2: 'CHUNG HWA', division: 'girls', time: '2025-08-05 13:00:00+08', venue: 'SJKC YU HWA' },
  { match_number: 74, team1: 'ANN TING', team2: 'SIN HOCK', division: 'girls', time: '2025-08-05 13:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 75, team1: 'CHUNG HWA', team2: 'PAYA RUMPUT', division: 'girls', time: '2025-08-05 13:20:00+08', venue: 'SJKC YU HWA' }
];

// Knockout stage placeholder matches (will be filled as tournament progresses)
const knockoutMatches = [
  // Boys Second Round (August 6) - 76-109
  ...Array.from({length: 34}, (_, i) => ({
    match_number: 76 + i,
    team1: null,
    team2: null,
    division: 'boys',
    time: `2025-08-06 ${String(8 + Math.floor(i/4)).padStart(2, '0')}:${(i % 4) * 20}:00+08`,
    venue: i % 2 === 0 ? 'SJKC YU HWA' : 'SJKC MALIM',
    round: 2,
    metadata: { description: `Boys Second Round Match ${i + 1}` }
  })),
  
  // Girls Quarter Finals (August 6) - 110-117
  ...Array.from({length: 8}, (_, i) => ({
    match_number: 110 + i,
    team1: null,
    team2: null,
    division: 'girls',
    time: `2025-08-06 ${String(14 + Math.floor(i/2)).padStart(2, '0')}:${(i % 2) * 20}:00+08`,
    venue: i % 2 === 0 ? 'SJKC YU HWA' : 'SJKC MALIM',
    round: 3,
    metadata: { description: `Girls Quarter Final ${i + 1}` }
  })),
  
  // Semi Finals (August 7) - 118-123
  { match_number: 118, team1: null, team2: null, division: 'boys', time: '2025-08-07 08:00:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Boys Semi Final 1' }},
  { match_number: 119, team1: null, team2: null, division: 'boys', time: '2025-08-07 08:20:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Boys Semi Final 2' }},
  { match_number: 120, team1: null, team2: null, division: 'girls', time: '2025-08-07 08:40:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 1' }},
  { match_number: 121, team1: null, team2: null, division: 'girls', time: '2025-08-07 09:00:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 2' }},
  { match_number: 122, team1: null, team2: null, division: 'girls', time: '2025-08-07 09:20:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 3' }},
  { match_number: 123, team1: null, team2: null, division: 'girls', time: '2025-08-07 09:40:00+08', venue: 'SJKC YU HWA', round: 4, metadata: { description: 'Girls Semi Final 4' }},
  
  // 3rd/4th Place & Finals (August 7) - 124-129
  { match_number: 124, team1: null, team2: null, division: 'boys', time: '2025-08-07 10:00:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Boys 3rd/4th Place' }},
  { match_number: 125, team1: null, team2: null, division: 'girls', time: '2025-08-07 10:20:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls 3rd/4th Place 1' }},
  { match_number: 126, team1: null, team2: null, division: 'girls', time: '2025-08-07 10:40:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls 3rd/4th Place 2' }},
  { match_number: 127, team1: null, team2: null, division: 'boys', time: '2025-08-07 11:00:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Boys Final' }},
  { match_number: 128, team1: null, team2: null, division: 'girls', time: '2025-08-07 11:20:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls Final 1' }},
  { match_number: 129, team1: null, team2: null, division: 'girls', time: '2025-08-07 11:40:00+08', venue: 'SJKC YU HWA', round: 5, metadata: { description: 'Girls Final 2' }}
];

console.log(`🏀 Loading remaining matches from PDF schedule...`)
console.log(`📊 Target: 129 total matches`)

// Check current match count
const { count: currentCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`📈 Current matches in database: ${currentCount}`)
console.log(`🎯 Need to add: ${129 - currentCount} more matches\n`)

let groupStageAdded = 0
let knockoutAdded = 0

// First, add group stage matches with real teams
console.log('Adding group stage matches with teams...')
for (const match of allMatches) {
  // Skip if we already have matches with higher numbers
  if (match.match_number <= currentCount) {
    continue
  }
  
  const team1Id = await getTeamUuid(match.team1, match.division)
  const team2Id = await getTeamUuid(match.team2, match.division)
  
  if (!team1Id || !team2Id) {
    console.log(`⚠️ Skipping match ${match.match_number}: Missing team(s) ${match.team1} vs ${match.team2}`)
    continue
  }
  
  const { error } = await supabase
    .from('tournament_matches')
    .insert({
      tournament_id: '66666666-6666-6666-6666-666666666666',
      round: 1, // Group stage
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
    groupStageAdded++
  }
}

// Then add knockout stage placeholder matches
console.log('\nAdding knockout stage placeholder matches...')
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
    console.log(`✅ Added knockout match ${match.match_number}: ${match.metadata?.description || 'Knockout stage'}`)
    knockoutAdded++
  }
}

// Final count check
const { count: finalCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`\n🎯 Summary:`)
console.log(`📊 Group stage matches added: ${groupStageAdded}`)
console.log(`🏆 Knockout matches added: ${knockoutAdded}`) 
console.log(`📈 Total matches now: ${finalCount}`)
console.log(`✅ Target achieved: ${finalCount >= 129 ? 'YES' : 'NO'}`)

if (finalCount >= 129) {
  console.log(`\n🏀 SUCCESS! All 129 matches from the PDF schedule are now loaded!`)
} else {
  console.log(`\n⚠️ Still need ${129 - finalCount} more matches`)
}