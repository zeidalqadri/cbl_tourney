import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

// Function to get team UUID by name and division (more flexible matching)
async function getTeamUuid(teamName, division) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('team_name', teamName)
    .eq('division', division)
    .single()
  
  if (error && error.code === 'PGRST116') {
    // Try alternative names for common variations
    const alternatives = {
      'AYER KEROH': 'AIR KEROH',
      'AIR KEROH': 'AYER KEROH'
    }
    
    if (alternatives[teamName]) {
      const { data: altData, error: altError } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
        .eq('team_name', alternatives[teamName])
        .eq('division', division)
        .single()
      
      if (!altError) return altData.id
    }
    
    return null
  }
  
  if (error) {
    console.log(`❌ Error finding team "${teamName}" (${division}):`, error.message)
    return null
  }
  
  return data.id
}

// Remaining group stage matches (31-75)
const remainingGroupMatches = [
  // Day 1 continues - Boys Group Stage
  { match_number: 36, team1: 'KEH SENG', team2: 'DUYONG', division: 'boys', time: '2025-08-04 13:40:00+08', venue: 'SJKC MALIM' },
  { match_number: 38, team1: 'PONDOK BATANG', team2: 'AIR KEROH', division: 'boys', time: '2025-08-04 14:00:00+08', venue: 'SJKC MALIM' },
  { match_number: 40, team1: 'CHABAU', team2: 'MACHAP', division: 'boys', time: '2025-08-04 14:20:00+08', venue: 'SJKC MALIM' },
  
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

// Fix the knockout matches with proper time calculation
const fixedKnockoutMatches = [
  // Boys Second Round (August 6) - matches with issues need proper times
  { match_number: 79, team1: null, team2: null, division: 'boys', time: '2025-08-06 09:00:00+08', venue: 'SJKC MALIM', round: 2 },
  { match_number: 83, team1: null, team2: null, division: 'boys', time: '2025-08-06 09:20:00+08', venue: 'SJKC MALIM', round: 2 },
  { match_number: 87, team1: null, team2: null, division: 'boys', time: '2025-08-06 09:40:00+08', venue: 'SJKC MALIM', round: 2 },
  { match_number: 91, team1: null, team2: null, division: 'boys', time: '2025-08-06 10:20:00+08', venue: 'SJKC MALIM', round: 2 },
  { match_number: 95, team1: null, team2: null, division: 'boys', time: '2025-08-06 11:00:00+08', venue: 'SJKC MALIM', round: 2 },
  { match_number: 99, team1: null, team2: null, division: 'boys', time: '2025-08-06 11:40:00+08', venue: 'SJKC MALIM', round: 2 },
  { match_number: 103, team1: null, team2: null, division: 'boys', time: '2025-08-06 12:20:00+08', venue: 'SJKC MALIM', round: 2 },
  { match_number: 107, team1: null, team2: null, division: 'boys', time: '2025-08-06 13:00:00+08', venue: 'SJKC MALIM', round: 2 }
];

console.log(`🏀 Completing tournament schedule...`)

// Check current count
const { count: currentCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`📊 Current matches: ${currentCount}`)

let groupAdded = 0
let knockoutAdded = 0

// Add remaining group stage matches
console.log('\n🏆 Adding remaining group stage matches...')
for (const match of remainingGroupMatches) {
  // Check if match already exists
  const { data: existing } = await supabase
    .from('tournament_matches')
    .select('id')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('match_number', match.match_number)
    .single()
  
  if (existing) {
    console.log(`⏭️  Match ${match.match_number} already exists`)
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
    groupAdded++
  }
}

// Fix the problematic knockout matches
console.log('\n🔧 Fixing knockout matches with time issues...')
for (const match of fixedKnockoutMatches) {
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
      metadata: { description: `Boys Second Round Match ${match.match_number - 75}` }
    })
  
  if (error) {
    console.log(`❌ Error adding knockout match ${match.match_number}:`, error.message)
  } else {
    console.log(`✅ Added knockout match ${match.match_number}`)
    knockoutAdded++
  }
}

// Final count
const { count: finalCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`\n🎯 Summary:`)
console.log(`📊 Group stage matches added: ${groupAdded}`)
console.log(`🏆 Knockout matches fixed: ${knockoutAdded}`)
console.log(`📈 Total matches now: ${finalCount}`)
console.log(`✅ Target achieved: ${finalCount >= 129 ? 'YES' : 'NO'}`)

if (finalCount >= 129) {
  console.log(`\n🏀 SUCCESS! Complete tournament schedule loaded!`)
  console.log(`🎮 Ready for MSS Melaka 2025 Basketball Tournament!`)
} else {
  console.log(`\n⚠️ Still need ${129 - finalCount} more matches`)
}