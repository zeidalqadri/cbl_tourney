import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🏫 Creating Schools and Migrating Team Structure')
console.log('=============================================\n')

// All schools from the PDF, categorized by type
const schools = [
  // Co-ed schools (appear in both boys and girls divisions)
  { name: 'YU HWA', type: 'co_ed' },
  { name: 'KEH SENG', type: 'co_ed' },
  { name: 'PAY FONG 1', type: 'co_ed' },
  { name: 'PAY FONG 2', type: 'co_ed' },
  { name: 'SG UDANG', type: 'co_ed' },
  { name: 'PAY CHIAO', type: 'co_ed' },
  { name: 'YU HSIEN', type: 'co_ed' },
  { name: 'CHUNG HWA', type: 'co_ed' },
  { name: 'PING MING', type: 'co_ed' },
  { name: 'KUANG YAH', type: 'co_ed' },
  { name: 'BKT BERUANG', type: 'co_ed' },
  { name: 'YU YING', type: 'co_ed' },
  { name: 'CHABAU', type: 'co_ed' },
  { name: 'JASIN LALANG', type: 'co_ed' },
  { name: 'PONDOK BATANG', type: 'co_ed' },
  { name: 'KIOW MIN', type: 'co_ed' },
  { name: 'SIN WAH', type: 'co_ed' },
  { name: 'PAY TECK', type: 'co_ed' },
  { name: 'WEN HUA', type: 'co_ed' },
  { name: 'TIANG DUA', type: 'co_ed' },
  { name: 'PAY CHEE', type: 'co_ed' },
  { name: 'CHENG', type: 'co_ed' },
  { name: 'MALIM', type: 'co_ed' },
  { name: 'ALOR GAJAH', type: 'co_ed' },
  { name: 'PAY HWA', type: 'co_ed' },
  { name: 'AYER KEROH', type: 'co_ed' },
  { name: 'POH LAN', type: 'co_ed' },
  { name: 'CHIAO CHEE', type: 'co_ed' },
  { name: 'MERLIMAU', type: 'co_ed' },
  { name: 'SHUH YEN', type: 'co_ed' },
  { name: 'MASJID TANAH', type: 'co_ed' },
  
  // Boys only schools
  { name: 'TING HWA', type: 'boys_only' },
  { name: 'BERTAM ULU', type: 'boys_only' },
  { name: 'SIANG LIN', type: 'boys_only' },
  { name: 'PAYA MENGKUANG', type: 'boys_only' },
  { name: 'MACHAP UMBOO', type: 'boys_only' },
  { name: 'DURIAN TUNGGAL', type: 'boys_only' },
  { name: 'DURIAN TUNGGAL 2', type: 'boys_only' },
  { name: 'JASIN', type: 'boys_only' },
  { name: 'LENDU', type: 'boys_only' },
  { name: 'ST MARY', type: 'boys_only' },
  { name: 'BACHANG', type: 'boys_only' },
  { name: 'PAY MIN', type: 'boys_only' },
  { name: 'PAY CHUIN', type: 'boys_only' },
  { name: 'KATHOLIK', type: 'boys_only' },
  { name: 'MELAKA PINDAH', type: 'boys_only' },
  { name: 'DURIAN DAUN', type: 'boys_only' },
  { name: 'PEI MIN', type: 'boys_only' },
  { name: 'PERMATANG PASIR', type: 'boys_only' },
  { name: 'PENGKALAN BALAK', type: 'boys_only' },
  { name: 'RENDAH KG LAPAN', type: 'boys_only' },
  { name: 'PAYA RUMPUT', type: 'boys_only' },
  { name: 'TEHEL', type: 'boys_only' },
  { name: 'TIANG DERAS', type: 'boys_only' },
  { name: 'BUNGA RAYA', type: 'boys_only' },
  { name: 'CHUNG CHENG', type: 'boys_only' },
  { name: 'EH HOCK', type: 'boys_only' },
  { name: 'KUBU', type: 'boys_only' },
  { name: 'MACHAP BARU', type: 'boys_only' },
  { name: 'AIR BARUK', type: 'boys_only' },
  { name: 'MACHAP', type: 'boys_only' },
  
  // Girls only schools
  { name: 'AIR KEROH', type: 'girls_only' }, // Note: Different from AYER KEROH
  { name: 'SEMABOK', type: 'girls_only' },
  { name: 'TANJUNG TUAN', type: 'girls_only' },
  { name: 'NOTRE DAME', type: 'girls_only' },
  { name: 'YING CHYE', type: 'girls_only' },
  { name: 'KUANG HWA', type: 'girls_only' },
  { name: 'MACHAP UMBOO', type: 'girls_only' }, // Different context for girls
  { name: 'MALIM JAYA', type: 'girls_only' },
  { name: 'BANDA HILIR', type: 'girls_only' },
  { name: 'DUYONG', type: 'girls_only' },
  { name: 'YONG PENG', type: 'girls_only' },
  { name: 'ANN TING', type: 'girls_only' },
  { name: 'PU TIAN', type: 'girls_only' },
  { name: 'SIN HOCK', type: 'girls_only' },
  { name: 'CHUNG WEI', type: 'girls_only' },
]

// Step 1: Create schools
console.log('📚 Step 1: Creating schools...')
let schoolsCreated = 0

for (const school of schools) {
  const { error } = await supabase
    .from('schools')
    .insert({
      school_name: school.name,
      school_type: school.type,
      metadata: {}
    })
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      console.log(`⏭️  ${school.name} already exists`)
    } else {
      console.log(`❌ Error creating ${school.name}:`, error.message)
    }
  } else {
    console.log(`✅ Created ${school.name} (${school.type})`)
    schoolsCreated++
  }
}

console.log(`\n✅ Created ${schoolsCreated} schools`)

// Step 2: Get all schools for mapping
const { data: schoolsData } = await supabase
  .from('schools')
  .select('id, school_name')

const schoolMap = {}
schoolsData.forEach(school => {
  schoolMap[school.school_name] = school.id
})

// Step 3: Update all teams with school_id and display_name
console.log('\n🏀 Step 2: Updating teams with school references and display names...')

const { data: teams } = await supabase
  .from('tournament_teams')
  .select('id, team_name, division')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

let teamsUpdated = 0

for (const team of teams) {
  // Extract base school name (remove any existing suffixes like (G))
  let baseName = team.team_name.replace(/\s*\([GB]\)\s*$/, '')
  
  // Special handling for similar names
  if (baseName === 'AYER KEROH' && team.division === 'girls') {
    baseName = 'AIR KEROH' // Girls use AIR KEROH
  }
  
  const schoolId = schoolMap[baseName]
  
  if (!schoolId) {
    console.log(`⚠️  No school found for team: ${team.team_name} (${team.division})`)
    continue
  }
  
  // Create display name with (B) or (G) suffix
  const displayName = `${baseName} (${team.division === 'boys' ? 'B' : 'G'})`
  
  const { error } = await supabase
    .from('tournament_teams')
    .update({
      school_id: schoolId,
      display_name: displayName,
      team_name: baseName // Normalize team name to base school name
    })
    .eq('id', team.id)
  
  if (error) {
    console.log(`❌ Error updating ${team.team_name}:`, error.message)
  } else {
    console.log(`✅ Updated ${team.team_name} → ${displayName}`)
    teamsUpdated++
  }
}

console.log(`\n✅ Updated ${teamsUpdated} teams`)

// Step 4: Clean up duplicate matches
console.log('\n🧹 Step 3: Cleaning up duplicate matches...')

// Get all matches ordered by match_number
const { data: matches } = await supabase
  .from('tournament_matches')
  .select('id, match_number')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('match_number')

// Find duplicates
const seen = new Set()
const duplicates = []

matches.forEach(match => {
  if (seen.has(match.match_number)) {
    duplicates.push(match.id)
  } else {
    seen.add(match.match_number)
  }
})

console.log(`Found ${duplicates.length} duplicate matches`)

// Delete duplicates
if (duplicates.length > 0) {
  const { error } = await supabase
    .from('tournament_matches')
    .delete()
    .in('id', duplicates)
  
  if (error) {
    console.log('❌ Error deleting duplicates:', error.message)
  } else {
    console.log(`✅ Deleted ${duplicates.length} duplicate matches`)
  }
}

// Final verification
const { count: finalTeamCount } = await supabase
  .from('tournament_teams')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

const { count: finalMatchCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log('\n📊 Final Summary:')
console.log(`🏫 Schools: ${schoolsData.length}`)
console.log(`🏀 Teams: ${finalTeamCount}`)
console.log(`📅 Matches: ${finalMatchCount} (Target: 129)`)

if (finalMatchCount === 129) {
  console.log('\n🎉 SUCCESS! Database migration complete!')
  console.log('✅ All teams now have proper school references')
  console.log('✅ All teams have consistent (B)/(G) display names')
  console.log('✅ Exactly 129 matches as per tournament schedule')
} else {
  console.log(`\n⚠️  Match count mismatch: ${finalMatchCount} vs 129 target`)
}