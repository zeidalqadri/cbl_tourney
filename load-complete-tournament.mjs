import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)
const tournamentId = '66666666-6666-6666-6666-666666666666'

// All teams from the PDF - Boys Division (Lelaki)
const boysTeams = [
  // Group LA
  { name: 'MALIM', pool: 'LA' },
  { name: 'TING HWA', pool: 'LA' },
  { name: 'BERTAM ULU', pool: 'LA' },
  
  // Group LB
  { name: 'WEN HUA', pool: 'LB' },
  { name: 'AYER KEROH', pool: 'LB' },
  { name: 'SIANG LIN', pool: 'LB' },
  
  // Group LC
  { name: 'MASJID TANAH', pool: 'LC' },
  { name: 'CHENG', pool: 'LC' },
  { name: 'SHUH YEN', pool: 'LC' },
  
  // Group LD
  { name: 'PAYA MENGKUANG', pool: 'LD' },
  { name: 'POH LAN', pool: 'LD' },
  { name: 'PONDOK BATANG', pool: 'LD' },
  { name: 'CHABAU', pool: 'LD' },
  
  // Group LE
  { name: 'PAY CHEE', pool: 'LE' },
  { name: 'PING MING', pool: 'LE' },
  { name: 'CHUNG HWA', pool: 'LE' },
  
  // Group LF
  { name: 'SG UDANG', pool: 'LF' },
  { name: 'MACHAP UMBOO', pool: 'LF' },
  { name: 'ALOR GAJAH', pool: 'LF' },
  
  // Group LG
  { name: 'PAY FONG 1', pool: 'LG' },
  { name: 'KEH SENG', pool: 'LG' },
  { name: 'MACHAP BARU', pool: 'LG' },
  
  // Group LH
  { name: 'YU HWA', pool: 'LH' },
  { name: 'YU YING', pool: 'LH' },
  { name: 'TIANG DUA', pool: 'LH' },
  
  // Group LI
  { name: 'MERLIMAU', pool: 'LI' },
  { name: 'CHIAO CHEE', pool: 'LI' },
  { name: 'JASIN LALANG', pool: 'LI' },
  
  // Group LJ
  { name: 'LENDU', pool: 'LJ' },
  { name: 'ST MARY', pool: 'LJ' },
  { name: 'BACHANG', pool: 'LJ' },
  
  // Group LK
  { name: 'PAY MIN', pool: 'LK' },
  { name: 'PAY CHIAO', pool: 'LK' },
  { name: 'SIN WAH', pool: 'LK' },
  
  // Group LL
  { name: 'YU HSIEN', pool: 'LL' },
  { name: 'PAY CHUIN', pool: 'LL' },
  { name: 'KATHOLIK', pool: 'LL' },
  
  // Group LM
  { name: 'KIOW MIN', pool: 'LM' },
  { name: 'PAY TECK', pool: 'LM' },
  { name: 'BKT BERUANG', pool: 'LM' },
  
  // Group LN
  { name: 'PAY FONG 2', pool: 'LN' },
  { name: 'PAY HWA', pool: 'LN' },
  { name: 'KUANG YAH', pool: 'LN' }
]

// All teams from the PDF - Girls Division (Perempuan)
const girlsTeams = [
  // Group PA
  { name: 'YU HWA', pool: 'PA' },
  { name: 'KEH SENG', pool: 'PA' },
  { name: 'PAY FONG 1', pool: 'PA' },
  { name: 'SG UDANG', pool: 'PA' },
  
  // Group PB
  { name: 'PAY CHIAO', pool: 'PB' },
  { name: 'YU HSIEN', pool: 'PB' },
  { name: 'CHUNG HWA', pool: 'PB' },
  { name: 'PING MING', pool: 'PB' },
  { name: 'KUANG YAH', pool: 'PB' },
  
  // Group PC
  { name: 'BKT BERUANG', pool: 'PC' },
  { name: 'YU YING', pool: 'PC' },
  { name: 'PAY FONG 2', pool: 'PC' },
  { name: 'NOTRE DAME', pool: 'PC' },
  
  // Group PD
  { name: 'CHABAU', pool: 'PD' },
  { name: 'JASIN LALANG', pool: 'PD' },
  { name: 'YING CHYE', pool: 'PD' },
  { name: 'PONDOK BATANG', pool: 'PD' },
  
  // Group PE
  { name: 'KIOW MIN', pool: 'PE' },
  { name: 'SIN WAH', pool: 'PE' },
  { name: 'PAY TECK', pool: 'PE' },
  { name: 'WEN HUA', pool: 'PE' },
  
  // Group PF
  { name: 'TIANG DUA', pool: 'PF' },
  { name: 'PAY CHEE', pool: 'PF' },
  { name: 'KUANG HWA', pool: 'PF' },
  { name: 'CHENG', pool: 'PF' },
  
  // Group PG
  { name: 'MALIM', pool: 'PG' },
  { name: 'ALOR GAJAH', pool: 'PG' },
  { name: 'PAY HWA', pool: 'PG' },
  { name: 'AYER KEROH', pool: 'PG' },
  { name: 'POH LAN', pool: 'PG' },
  
  // Group PH
  { name: 'CHIAO CHEE', pool: 'PH' },
  { name: 'MERLIMAU', pool: 'PH' },
  { name: 'SHUH YEN', pool: 'PH' },
  { name: 'MASJID TANAH', pool: 'PH' }
]

// Function to add or update team
async function ensureTeam(teamName, division, pool) {
  const { data: existing, error: checkError } = await supabase
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('team_name', teamName)
    .eq('division', division)
    .single()
  
  if (existing) {
    // Update pool if needed
    const { error: updateError } = await supabase
      .from('tournament_teams')
      .update({ pool })
      .eq('id', existing.id)
    
    if (updateError) {
      console.log(`❌ Error updating ${teamName} (${division}):`, updateError.message)
    }
    return existing.id
  }
  
  // Create new team
  const { data: newTeam, error: insertError } = await supabase
    .from('tournament_teams')
    .insert({
      tournament_id: tournamentId,
      team_name: teamName,
      division: division,
      pool: pool,
      coach: 'TBD',
      seed: 1,
      jersey_color: division === 'boys' ? '#0066CC' : '#FF69B4',
      stats: {},
      roster: [],
      metadata: {}
    })
    .select('id')
    .single()
  
  if (insertError) {
    console.log(`❌ Error adding ${teamName} (${division}):`, insertError.message)
    return null
  }
  
  console.log(`✅ Added ${teamName} (${division}) to group ${pool}`)
  return newTeam.id
}

// Function to get team UUID
async function getTeamUuid(teamName, division) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('team_name', teamName)
    .eq('division', division)
    .single()
  
  if (error) {
    console.log(`❌ Team not found: ${teamName} (${division})`)
    return null
  }
  
  return data.id
}

console.log('🏀 MSS Melaka 2025 Basketball Tournament - Complete Load')
console.log('================================================\n')

// Step 1: Ensure all teams exist
console.log('📋 Step 1: Loading all teams...\n')

console.log('👦 Loading Boys Teams:')
for (const team of boysTeams) {
  await ensureTeam(team.name, 'boys', team.pool)
}

console.log('\n👧 Loading Girls Teams:')
for (const team of girlsTeams) {
  await ensureTeam(team.name, 'girls', team.pool)
}

// Count teams
const { count: boysCount } = await supabase
  .from('tournament_teams')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', tournamentId)
  .eq('division', 'boys')

const { count: girlsCount } = await supabase
  .from('tournament_teams')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', tournamentId)
  .eq('division', 'girls')

console.log(`\n📊 Team Summary:`)
console.log(`   Boys teams: ${boysCount}`)
console.log(`   Girls teams: ${girlsCount}`)
console.log(`   Total teams: ${boysCount + girlsCount}`)

// Step 2: Load all matches
console.log('\n📋 Step 2: Loading all matches...\n')

// All matches from the PDF schedule
const matches = [
  // Day 1: August 4, 2025 - Boys only
  // YU HWA (Gelanggang A)
  { match: 1, team1: 'YU HWA', team2: 'YU YING', division: 'boys', time: '2025-08-04 08:00:00+08', venue: 'SJKC YU HWA' },
  { match: 3, team1: 'ST MARY', team2: 'BACHANG', division: 'boys', time: '2025-08-04 08:20:00+08', venue: 'SJKC YU HWA' },
  { match: 5, team1: 'PAY MIN', team2: 'SIN WAH', division: 'boys', time: '2025-08-04 08:40:00+08', venue: 'SJKC YU HWA' },
  { match: 7, team1: 'MERLIMAU', team2: 'CHIAO CHEE', division: 'boys', time: '2025-08-04 09:00:00+08', venue: 'SJKC YU HWA' },
  { match: 9, team1: 'YU YING', team2: 'TIANG DUA', division: 'boys', time: '2025-08-04 09:20:00+08', venue: 'SJKC YU HWA' },
  { match: 11, team1: 'BACHANG', team2: 'LENDU', division: 'boys', time: '2025-08-04 09:40:00+08', venue: 'SJKC YU HWA' },
  { match: 13, team1: 'SIN WAH', team2: 'PAY CHIAO', division: 'boys', time: '2025-08-04 10:00:00+08', venue: 'SJKC YU HWA' },
  { match: 15, team1: 'CHIAO CHEE', team2: 'JASIN LALANG', division: 'boys', time: '2025-08-04 10:20:00+08', venue: 'SJKC YU HWA' },
  { match: 17, team1: 'TIANG DUA', team2: 'YU HWA', division: 'boys', time: '2025-08-04 10:40:00+08', venue: 'SJKC YU HWA' },
  { match: 19, team1: 'LENDU', team2: 'ST MARY', division: 'boys', time: '2025-08-04 11:00:00+08', venue: 'SJKC YU HWA' },
  { match: 21, team1: 'PAY CHIAO', team2: 'PAY MIN', division: 'boys', time: '2025-08-04 11:20:00+08', venue: 'SJKC YU HWA' },
  { match: 23, team1: 'JASIN LALANG', team2: 'MERLIMAU', division: 'boys', time: '2025-08-04 11:40:00+08', venue: 'SJKC YU HWA' },
  { match: 25, team1: 'YU HSIEN', team2: 'PAY CHUIN', division: 'boys', time: '2025-08-04 12:00:00+08', venue: 'SJKC YU HWA' },
  { match: 27, team1: 'KIOW MIN', team2: 'PAY TECK', division: 'boys', time: '2025-08-04 12:20:00+08', venue: 'SJKC YU HWA' },
  { match: 29, team1: 'PAY FONG 2', team2: 'PAY HWA', division: 'boys', time: '2025-08-04 12:40:00+08', venue: 'SJKC YU HWA' },
  { match: 31, team1: 'PAY CHUIN', team2: 'KATHOLIK', division: 'boys', time: '2025-08-04 13:00:00+08', venue: 'SJKC YU HWA' },
  { match: 33, team1: 'PAY TECK', team2: 'BKT BERUANG', division: 'boys', time: '2025-08-04 13:20:00+08', venue: 'SJKC YU HWA' },
  { match: 35, team1: 'PAY HWA', team2: 'KUANG YAH', division: 'boys', time: '2025-08-04 13:40:00+08', venue: 'SJKC YU HWA' },
  { match: 37, team1: 'KATHOLIK', team2: 'YU HSIEN', division: 'boys', time: '2025-08-04 14:00:00+08', venue: 'SJKC YU HWA' },
  { match: 39, team1: 'BKT BERUANG', team2: 'KIOW MIN', division: 'boys', time: '2025-08-04 14:20:00+08', venue: 'SJKC YU HWA' },
  { match: 41, team1: 'KUANG YAH', team2: 'PAY FONG 2', division: 'boys', time: '2025-08-04 14:40:00+08', venue: 'SJKC YU HWA' },
  
  // MALIM (Gelanggang B)
  { match: 2, team1: 'MALIM', team2: 'TING HWA', division: 'boys', time: '2025-08-04 08:00:00+08', venue: 'SJKC MALIM' },
  { match: 4, team1: 'WEN HUA', team2: 'AYER KEROH', division: 'boys', time: '2025-08-04 08:20:00+08', venue: 'SJKC MALIM' },
  { match: 6, team1: 'CHENG', team2: 'SHUH YEN', division: 'boys', time: '2025-08-04 08:40:00+08', venue: 'SJKC MALIM' },
  { match: 8, team1: 'TING HWA', team2: 'BERTAM ULU', division: 'boys', time: '2025-08-04 09:00:00+08', venue: 'SJKC MALIM' },
  { match: 10, team1: 'AYER KEROH', team2: 'SIANG LIN', division: 'boys', time: '2025-08-04 09:20:00+08', venue: 'SJKC MALIM' },
  { match: 12, team1: 'SHUH YEN', team2: 'MASJID TANAH', division: 'boys', time: '2025-08-04 09:40:00+08', venue: 'SJKC MALIM' },
  { match: 14, team1: 'BERTAM ULU', team2: 'MALIM', division: 'boys', time: '2025-08-04 10:00:00+08', venue: 'SJKC MALIM' },
  { match: 16, team1: 'SIANG LIN', team2: 'WEN HUA', division: 'boys', time: '2025-08-04 10:20:00+08', venue: 'SJKC MALIM' },
  { match: 18, team1: 'MASJID TANAH', team2: 'CHENG', division: 'boys', time: '2025-08-04 10:40:00+08', venue: 'SJKC MALIM' },
  { match: 20, team1: 'PAYA MENGKUANG', team2: 'POH LAN', division: 'boys', time: '2025-08-04 11:00:00+08', venue: 'SJKC MALIM' },
  { match: 22, team1: 'PONDOK BATANG', team2: 'CHABAU', division: 'boys', time: '2025-08-04 11:20:00+08', venue: 'SJKC MALIM' },
  { match: 24, team1: 'PAY CHEE', team2: 'PING MING', division: 'boys', time: '2025-08-04 11:40:00+08', venue: 'SJKC MALIM' },
  { match: 26, team1: 'SG UDANG', team2: 'MACHAP UMBOO', division: 'boys', time: '2025-08-04 12:00:00+08', venue: 'SJKC MALIM' },
  { match: 28, team1: 'PAY FONG 1', team2: 'KEH SENG', division: 'boys', time: '2025-08-04 12:20:00+08', venue: 'SJKC MALIM' },
  { match: 30, team1: 'PAYA MENGKUANG', team2: 'PONDOK BATANG', division: 'boys', time: '2025-08-04 12:40:00+08', venue: 'SJKC MALIM' },
  { match: 32, team1: 'POH LAN', team2: 'CHABAU', division: 'boys', time: '2025-08-04 13:00:00+08', venue: 'SJKC MALIM' },
  { match: 34, team1: 'PING MING', team2: 'CHUNG HWA', division: 'boys', time: '2025-08-04 13:20:00+08', venue: 'SJKC MALIM' },
  { match: 36, team1: 'MACHAP UMBOO', team2: 'ALOR GAJAH', division: 'boys', time: '2025-08-04 13:40:00+08', venue: 'SJKC MALIM' },
  { match: 38, team1: 'KEH SENG', team2: 'MACHAP BARU', division: 'boys', time: '2025-08-04 14:00:00+08', venue: 'SJKC MALIM' },
  { match: 40, team1: 'CHABAU', team2: 'PAYA MENGKUANG', division: 'boys', time: '2025-08-04 14:20:00+08', venue: 'SJKC MALIM' },
  { match: 42, team1: 'PONDOK BATANG', team2: 'POH LAN', division: 'boys', time: '2025-08-04 14:40:00+08', venue: 'SJKC MALIM' },
  { match: 43, team1: 'CHUNG HWA', team2: 'PAY CHEE', division: 'boys', time: '2025-08-04 15:20:00+08', venue: 'SJKC MALIM' },
  { match: 44, team1: 'ALOR GAJAH', team2: 'SG UDANG', division: 'boys', time: '2025-08-04 15:40:00+08', venue: 'SJKC MALIM' },
  { match: 45, team1: 'MACHAP BARU', team2: 'PAY FONG 1', division: 'boys', time: '2025-08-04 16:00:00+08', venue: 'SJKC MALIM' },
  
  // Day 2: August 5, 2025 - Girls matches
  // YU HWA (Gelanggang A)
  { match: 46, team1: 'YU HWA', team2: 'KEH SENG', division: 'girls', time: '2025-08-05 08:00:00+08', venue: 'SJKC YU HWA' },
  { match: 48, team1: 'PAY FONG 1', team2: 'SG UDANG', division: 'girls', time: '2025-08-05 08:20:00+08', venue: 'SJKC YU HWA' },
  { match: 50, team1: 'PAY CHIAO', team2: 'PING MING', division: 'girls', time: '2025-08-05 08:40:00+08', venue: 'SJKC YU HWA' },
  { match: 52, team1: 'YU HSIEN', team2: 'CHUNG HWA', division: 'girls', time: '2025-08-05 09:00:00+08', venue: 'SJKC YU HWA' },
  { match: 54, team1: 'BKT BERUANG', team2: 'YU YING', division: 'girls', time: '2025-08-05 09:20:00+08', venue: 'SJKC YU HWA' },
  { match: 56, team1: 'PAY FONG 2', team2: 'NOTRE DAME', division: 'girls', time: '2025-08-05 09:40:00+08', venue: 'SJKC YU HWA' },
  { match: 58, team1: 'CHABAU', team2: 'JASIN LALANG', division: 'girls', time: '2025-08-05 10:00:00+08', venue: 'SJKC YU HWA' },
  { match: 60, team1: 'YING CHYE', team2: 'PONDOK BATANG', division: 'girls', time: '2025-08-05 10:20:00+08', venue: 'SJKC YU HWA' },
  { match: 62, team1: 'PING MING', team2: 'KUANG YAH', division: 'girls', time: '2025-08-05 10:40:00+08', venue: 'SJKC YU HWA' },
  { match: 64, team1: 'CHUNG HWA', team2: 'PAY CHIAO', division: 'girls', time: '2025-08-05 11:00:00+08', venue: 'SJKC YU HWA' },
  { match: 66, team1: 'YU HWA', team2: 'PAY FONG 1', division: 'girls', time: '2025-08-05 11:20:00+08', venue: 'SJKC YU HWA' },
  { match: 68, team1: 'KEH SENG', team2: 'SG UDANG', division: 'girls', time: '2025-08-05 11:40:00+08', venue: 'SJKC YU HWA' },
  { match: 70, team1: 'BKT BERUANG', team2: 'PAY FONG 2', division: 'girls', time: '2025-08-05 12:00:00+08', venue: 'SJKC YU HWA' },
  { match: 72, team1: 'YU YING', team2: 'NOTRE DAME', division: 'girls', time: '2025-08-05 12:20:00+08', venue: 'SJKC YU HWA' },
  { match: 74, team1: 'KUANG YAH', team2: 'CHUNG HWA', division: 'girls', time: '2025-08-05 12:40:00+08', venue: 'SJKC YU HWA' },
  { match: 76, team1: 'PAY CHIAO', team2: 'YU HSIEN', division: 'girls', time: '2025-08-05 13:00:00+08', venue: 'SJKC YU HWA' },
  { match: 78, team1: 'CHABAU', team2: 'YING CHYE', division: 'girls', time: '2025-08-05 13:20:00+08', venue: 'SJKC YU HWA' },
  { match: 80, team1: 'JASIN LALANG', team2: 'PONDOK BATANG', division: 'girls', time: '2025-08-05 13:40:00+08', venue: 'SJKC YU HWA' },
  { match: 82, team1: 'SG UDANG', team2: 'YU HWA', division: 'girls', time: '2025-08-05 14:00:00+08', venue: 'SJKC YU HWA' },
  { match: 84, team1: 'PAY FONG 1', team2: 'KEH SENG', division: 'girls', time: '2025-08-05 14:20:00+08', venue: 'SJKC YU HWA' },
  { match: 86, team1: 'YU HSIEN', team2: 'KUANG YAH', division: 'girls', time: '2025-08-05 14:40:00+08', venue: 'SJKC YU HWA' },
  { match: 88, team1: 'CHUNG HWA', team2: 'PING MING', division: 'girls', time: '2025-08-05 15:00:00+08', venue: 'SJKC YU HWA' },
  { match: 90, team1: 'NOTRE DAME', team2: 'BKT BERUANG', division: 'girls', time: '2025-08-05 15:20:00+08', venue: 'SJKC YU HWA' },
  { match: 92, team1: 'PAY FONG 2', team2: 'YU YING', division: 'girls', time: '2025-08-05 15:40:00+08', venue: 'SJKC YU HWA' },
  { match: 94, team1: 'PONDOK BATANG', team2: 'CHABAU', division: 'girls', time: '2025-08-05 16:00:00+08', venue: 'SJKC YU HWA' },
  { match: 96, team1: 'YING CHYE', team2: 'JASIN LALANG', division: 'girls', time: '2025-08-05 16:20:00+08', venue: 'SJKC YU HWA' },
  { match: 98, team1: 'PING MING', team2: 'YU HSIEN', division: 'girls', time: '2025-08-05 16:40:00+08', venue: 'SJKC YU HWA' },
  { match: 100, team1: 'KUANG YAH', team2: 'PAY CHIAO', division: 'girls', time: '2025-08-05 17:00:00+08', venue: 'SJKC YU HWA' },
  
  // MALIM (Gelanggang B)
  { match: 47, team1: 'PAY TECK', team2: 'WEN HUA', division: 'girls', time: '2025-08-05 08:00:00+08', venue: 'SJKC MALIM' },
  { match: 49, team1: 'KIOW MIN', team2: 'SIN WAH', division: 'girls', time: '2025-08-05 08:20:00+08', venue: 'SJKC MALIM' },
  { match: 51, team1: 'AYER KEROH', team2: 'POH LAN', division: 'girls', time: '2025-08-05 08:40:00+08', venue: 'SJKC MALIM' },
  { match: 53, team1: 'PAY HWA', team2: 'MALIM', division: 'girls', time: '2025-08-05 09:00:00+08', venue: 'SJKC MALIM' },
  { match: 55, team1: 'TIANG DUA', team2: 'PAY CHEE', division: 'girls', time: '2025-08-05 09:20:00+08', venue: 'SJKC MALIM' },
  { match: 57, team1: 'KUANG HWA', team2: 'CHENG', division: 'girls', time: '2025-08-05 09:40:00+08', venue: 'SJKC MALIM' },
  { match: 59, team1: 'CHIAO CHEE', team2: 'MERLIMAU', division: 'girls', time: '2025-08-05 10:00:00+08', venue: 'SJKC MALIM' },
  { match: 61, team1: 'SHUH YEN', team2: 'MASJID TANAH', division: 'girls', time: '2025-08-05 10:20:00+08', venue: 'SJKC MALIM' },
  { match: 63, team1: 'POH LAN', team2: 'PAY HWA', division: 'girls', time: '2025-08-05 10:40:00+08', venue: 'SJKC MALIM' },
  { match: 65, team1: 'MALIM', team2: 'ALOR GAJAH', division: 'girls', time: '2025-08-05 11:00:00+08', venue: 'SJKC MALIM' },
  { match: 67, team1: 'PAY TECK', team2: 'KIOW MIN', division: 'girls', time: '2025-08-05 11:20:00+08', venue: 'SJKC MALIM' },
  { match: 69, team1: 'WEN HUA', team2: 'SIN WAH', division: 'girls', time: '2025-08-05 11:40:00+08', venue: 'SJKC MALIM' },
  { match: 71, team1: 'TIANG DUA', team2: 'KUANG HWA', division: 'girls', time: '2025-08-05 12:00:00+08', venue: 'SJKC MALIM' },
  { match: 73, team1: 'PAY CHEE', team2: 'CHENG', division: 'girls', time: '2025-08-05 12:20:00+08', venue: 'SJKC MALIM' },
  { match: 75, team1: 'ALOR GAJAH', team2: 'POH LAN', division: 'girls', time: '2025-08-05 12:40:00+08', venue: 'SJKC MALIM' },
  { match: 77, team1: 'PAY HWA', team2: 'AYER KEROH', division: 'girls', time: '2025-08-05 13:00:00+08', venue: 'SJKC MALIM' },
  { match: 79, team1: 'CHIAO CHEE', team2: 'SHUH YEN', division: 'girls', time: '2025-08-05 13:20:00+08', venue: 'SJKC MALIM' },
  { match: 81, team1: 'MERLIMAU', team2: 'MASJID TANAH', division: 'girls', time: '2025-08-05 13:40:00+08', venue: 'SJKC MALIM' },
  { match: 83, team1: 'SIN WAH', team2: 'PAY TECK', division: 'girls', time: '2025-08-05 14:00:00+08', venue: 'SJKC MALIM' },
  { match: 85, team1: 'KIOW MIN', team2: 'WEN HUA', division: 'girls', time: '2025-08-05 14:20:00+08', venue: 'SJKC MALIM' },
  { match: 87, team1: 'AYER KEROH', team2: 'ALOR GAJAH', division: 'girls', time: '2025-08-05 14:40:00+08', venue: 'SJKC MALIM' },
  { match: 89, team1: 'POH LAN', team2: 'MALIM', division: 'girls', time: '2025-08-05 15:00:00+08', venue: 'SJKC MALIM' },
  { match: 91, team1: 'CHENG', team2: 'TIANG DUA', division: 'girls', time: '2025-08-05 15:20:00+08', venue: 'SJKC MALIM' },
  { match: 93, team1: 'KUANG HWA', team2: 'PAY CHEE', division: 'girls', time: '2025-08-05 15:40:00+08', venue: 'SJKC MALIM' },
  { match: 95, team1: 'MASJID TANAH', team2: 'CHIAO CHEE', division: 'girls', time: '2025-08-05 16:00:00+08', venue: 'SJKC MALIM' },
  { match: 97, team1: 'SHUH YEN', team2: 'MERLIMAU', division: 'girls', time: '2025-08-05 16:20:00+08', venue: 'SJKC MALIM' },
  { match: 99, team1: 'ALOR GAJAH', team2: 'PAY HWA', division: 'girls', time: '2025-08-05 16:40:00+08', venue: 'SJKC MALIM' },
  { match: 101, team1: 'MALIM', team2: 'AYER KEROH', division: 'girls', time: '2025-08-05 17:00:00+08', venue: 'SJKC MALIM' }
]

// Knockout stage placeholder matches
const knockoutMatches = [
  // Day 3: August 6, 2025
  // Girls Quarter Finals
  { match: 102, metadata: { description: 'Girls Quarter Final 1', placeholder1: 'Winner PA', placeholder2: 'Winner PB' }, round: 3, time: '2025-08-06 08:00:00+08', venue: 'SJKC YU HWA' },
  { match: 109, metadata: { description: 'Girls Quarter Final 2', placeholder1: 'Winner PC', placeholder2: 'Winner PD' }, round: 3, time: '2025-08-06 10:20:00+08', venue: 'SJKC YU HWA' },
  { match: 116, metadata: { description: 'Girls Quarter Final 3', placeholder1: 'Winner PE', placeholder2: 'Winner PF' }, round: 3, time: '2025-08-06 12:40:00+08', venue: 'SJKC YU HWA' },
  { match: 123, metadata: { description: 'Girls Quarter Final 4', placeholder1: 'Winner PG', placeholder2: 'Winner PH' }, round: 3, time: '2025-08-06 13:00:00+08', venue: 'SJKC YU HWA' },
  
  // Boys Second Round
  { match: 103, metadata: { description: 'Boys Second Round 1', placeholder1: 'Winner LB', placeholder2: 'Winner LC' }, round: 2, time: '2025-08-06 08:20:00+08', venue: 'SJKC YU HWA' },
  { match: 104, metadata: { description: 'Boys Second Round 2', placeholder1: 'Winner LD', placeholder2: 'Winner LE' }, round: 2, time: '2025-08-06 08:40:00+08', venue: 'SJKC YU HWA' },
  { match: 105, metadata: { description: 'Boys Second Round 3', placeholder1: 'Winner LF', placeholder2: 'Winner LG' }, round: 2, time: '2025-08-06 09:00:00+08', venue: 'SJKC YU HWA' },
  { match: 106, metadata: { description: 'Boys Second Round 4', placeholder1: 'Winner LH', placeholder2: 'Winner LI' }, round: 2, time: '2025-08-06 09:20:00+08', venue: 'SJKC YU HWA' },
  { match: 107, metadata: { description: 'Boys Second Round 5', placeholder1: 'Winner LJ', placeholder2: 'Winner LK' }, round: 2, time: '2025-08-06 09:40:00+08', venue: 'SJKC YU HWA' },
  { match: 108, metadata: { description: 'Boys Second Round 6', placeholder1: 'Winner LM', placeholder2: 'Winner LN' }, round: 2, time: '2025-08-06 10:00:00+08', venue: 'SJKC YU HWA' },
  { match: 110, metadata: { description: 'Boys Second Round 7', placeholder1: 'Winner LC', placeholder2: 'Winner LA' }, round: 2, time: '2025-08-06 10:40:00+08', venue: 'SJKC YU HWA' },
  { match: 111, metadata: { description: 'Boys Second Round 8', placeholder1: 'Winner LD', placeholder2: 'Winner LF' }, round: 2, time: '2025-08-06 11:00:00+08', venue: 'SJKC YU HWA' },
  { match: 112, metadata: { description: 'Boys Second Round 9', placeholder1: 'Winner LE', placeholder2: 'Winner LG' }, round: 2, time: '2025-08-06 11:20:00+08', venue: 'SJKC YU HWA' },
  { match: 113, metadata: { description: 'Boys Second Round 10', placeholder1: 'Winner LH', placeholder2: 'Winner LJ' }, round: 2, time: '2025-08-06 11:40:00+08', venue: 'SJKC YU HWA' },
  { match: 114, metadata: { description: 'Boys Second Round 11', placeholder1: 'Winner LI', placeholder2: 'Winner LK' }, round: 2, time: '2025-08-06 12:00:00+08', venue: 'SJKC YU HWA' },
  { match: 115, metadata: { description: 'Boys Second Round 12', placeholder1: 'Winner LN', placeholder2: 'Winner LL' }, round: 2, time: '2025-08-06 12:20:00+08', venue: 'SJKC YU HWA' },
  { match: 117, metadata: { description: 'Boys Second Round 13', placeholder1: 'Winner LA', placeholder2: 'Winner LB' }, round: 2, time: '2025-08-06 13:00:00+08', venue: 'SJKC YU HWA' },
  { match: 118, metadata: { description: 'Boys Second Round 14', placeholder1: 'Winner LG', placeholder2: 'Winner LD' }, round: 2, time: '2025-08-06 13:20:00+08', venue: 'SJKC YU HWA' },
  { match: 119, metadata: { description: 'Boys Second Round 15', placeholder1: 'Winner LF', placeholder2: 'Winner LE' }, round: 2, time: '2025-08-06 13:40:00+08', venue: 'SJKC YU HWA' },
  { match: 120, metadata: { description: 'Boys Second Round 16', placeholder1: 'Winner LK', placeholder2: 'Winner LH' }, round: 2, time: '2025-08-06 14:00:00+08', venue: 'SJKC YU HWA' },
  { match: 121, metadata: { description: 'Boys Second Round 17', placeholder1: 'Winner LJ', placeholder2: 'Winner LI' }, round: 2, time: '2025-08-06 14:20:00+08', venue: 'SJKC YU HWA' },
  { match: 122, metadata: { description: 'Boys Second Round 18', placeholder1: 'Winner LL', placeholder2: 'Winner LM' }, round: 2, time: '2025-08-06 14:40:00+08', venue: 'SJKC YU HWA' },
  
  // Day 4: August 7, 2025 - Finals
  { match: 124, metadata: { description: 'Girls Semi Final 1', placeholder1: 'Winner PQF1', placeholder2: 'Winner PQF2' }, round: 4, time: '2025-08-07 08:00:00+08', venue: 'SJKC YU HWA' },
  { match: 125, metadata: { description: 'Girls Semi Final 2', placeholder1: 'Winner PQF3', placeholder2: 'Winner PQF4' }, round: 4, time: '2025-08-07 08:40:00+08', venue: 'SJKC YU HWA' },
  { match: 126, metadata: { description: 'Boys Semi Final 1', placeholder1: 'Winner LXA', placeholder2: 'Winner LXB' }, round: 4, time: '2025-08-07 09:20:00+08', venue: 'SJKC YU HWA' },
  { match: 127, metadata: { description: 'Boys Semi Final 2', placeholder1: 'Winner LYA', placeholder2: 'Winner LYB' }, round: 4, time: '2025-08-07 10:00:00+08', venue: 'SJKC YU HWA' },
  { match: 128, metadata: { description: 'Girls Final', placeholder1: 'Winner PSF1', placeholder2: 'Winner PSF2' }, round: 5, time: '2025-08-07 11:00:00+08', venue: 'SJKC YU HWA' },
  { match: 129, metadata: { description: 'Boys Final', placeholder1: 'Winner LSF1', placeholder2: 'Winner LSF2' }, round: 5, time: '2025-08-07 12:00:00+08', venue: 'SJKC YU HWA' }
]

let groupAdded = 0
let knockoutAdded = 0

// Add group stage matches
for (const match of matches) {
  // Check if match already exists
  const { data: existing } = await supabase
    .from('tournament_matches')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('match_number', match.match)
    .single()
  
  if (existing) {
    continue
  }
  
  const team1Id = await getTeamUuid(match.team1, match.division)
  const team2Id = await getTeamUuid(match.team2, match.division)
  
  if (!team1Id || !team2Id) {
    console.log(`⚠️ Skipping match ${match.match}: Missing teams`)
    continue
  }
  
  const { error } = await supabase
    .from('tournament_matches')
    .insert({
      tournament_id: tournamentId,
      round: 1,
      match_number: match.match,
      team1_id: team1Id,
      team2_id: team2Id,
      scheduled_time: match.time,
      venue: match.venue,
      status: 'pending'
    })
  
  if (error) {
    console.log(`❌ Error adding match ${match.match}:`, error.message)
  } else {
    groupAdded++
  }
}

// Add knockout stage placeholder matches
for (const match of knockoutMatches) {
  // Check if match already exists
  const { data: existing } = await supabase
    .from('tournament_matches')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('match_number', match.match)
    .single()
  
  if (existing) {
    continue
  }
  
  const { error } = await supabase
    .from('tournament_matches')
    .insert({
      tournament_id: tournamentId,
      round: match.round,
      match_number: match.match,
      team1_id: null,
      team2_id: null,
      scheduled_time: match.time,
      venue: match.venue,
      status: 'pending',
      metadata: match.metadata
    })
  
  if (error) {
    console.log(`❌ Error adding knockout match ${match.match}:`, error.message)
  } else {
    knockoutAdded++
  }
}

// Final count
const { count: finalCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', tournamentId)

console.log(`\n📊 Match Summary:`)
console.log(`   Group stage matches added: ${groupAdded}`)
console.log(`   Knockout matches added: ${knockoutAdded}`)
console.log(`   Total matches: ${finalCount}/129`)

if (finalCount >= 129) {
  console.log(`\n🏀 SUCCESS! Complete tournament schedule loaded!`)
  console.log(`🎮 MSS Melaka 2025 Basketball Tournament is ready!`)
} else {
  console.log(`\n⚠️ Need ${129 - finalCount} more matches`)
}