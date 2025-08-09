import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

// Girls teams that appear in the PDF schedule (based on the matches I saw)
const girlsTeams = [
  // Group PA
  { name: 'RENDAH KG LAPAN', pool: 'PA' },
  { name: 'LENDU', pool: 'PA' },
  { name: 'BANDA KABA', pool: 'PA' },
  
  // Group PB  
  { name: 'PAY FONG 2', pool: 'PB' },
  { name: 'PONDOK BATANG', pool: 'PB' },
  { name: 'MELAKA PINDAH', pool: 'PB' },
  
  // Group PC
  { name: 'SEMABOK', pool: 'PC' },
  { name: 'AIR KEROH', pool: 'PC' },
  { name: 'SG UDANG', pool: 'PC' },
  
  // Group PD
  { name: 'PAY FONG 1', pool: 'PD' },
  { name: 'PAYA MENGKUANG', pool: 'PD' },
  { name: 'PENGKALAN BALAK', pool: 'PD' },
  
  // Group PE
  { name: 'TIANG DERAS', pool: 'PE' },
  { name: 'MACHAP UMBOO', pool: 'PE' },
  { name: 'MALIM JAYA', pool: 'PE' },
  
  // Group PF
  { name: 'CHABAU', pool: 'PF' },
  { name: 'MACHAP', pool: 'PF' },
  { name: 'KEH SENG', pool: 'PF' },
  
  // Group PG
  { name: 'AIR BARUK', pool: 'PG' },
  { name: 'DURIAN TUNGGAL', pool: 'PG' },
  { name: 'BANDA HILIR', pool: 'PG' },
  
  // Group PH
  { name: 'POH LAN', pool: 'PH' },
  { name: 'DUYONG', pool: 'PH' },
  { name: 'YONG PENG', pool: 'PH' },
  
  // Additional teams from the schedule
  { name: 'SIN HOCK', pool: 'PI' },
  { name: 'PU TIAN', pool: 'PI' },
  { name: 'ANN TING', pool: 'PI' },
  
  { name: 'PAYA RUMPUT', pool: 'PJ' },
  { name: 'CHUNG WEI', pool: 'PJ' },
  { name: 'CHUNG HWA', pool: 'PJ' }
]

console.log(`👧 Adding ${girlsTeams.length} girls teams...`)

let added = 0

for (const team of girlsTeams) {
  // Check if team already exists
  const { data: existing } = await supabase
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('team_name', team.name)
    .eq('division', 'girls')
    .single()
  
  if (existing) {
    console.log(`⏭️  ${team.name} already exists`)
    continue
  }
  
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
      metadata: {}
    })
  
  if (error) {
    console.log(`❌ Error adding ${team.name}:`, error.message)
  } else {
    console.log(`✅ Added ${team.name} (Group ${team.pool})`)
    added++
  }
}

console.log(`\n🎯 Added ${added} girls teams`)

// Also fix some boys team names that don't match the schedule
const boysTeamFixes = [
  { from: 'AYER KEROH', to: 'AIR KEROH' }, // Common spelling variation
  // Add more as needed
]

console.log(`\n🔧 Fixing boys team names...`)
for (const fix of boysTeamFixes) {
  const { error } = await supabase
    .from('tournament_teams')
    .update({ team_name: fix.to })
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('team_name', fix.from)
    .eq('division', 'boys')
  
  if (error) {
    console.log(`❌ Error fixing ${fix.from} → ${fix.to}:`, error.message)
  } else {
    console.log(`✅ Fixed ${fix.from} → ${fix.to}`)
  }
}

// Final count
const { count: finalCount } = await supabase
  .from('tournament_teams')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`\n📊 Total teams now: ${finalCount}`)

const { count: girlsCount } = await supabase
  .from('tournament_teams')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .eq('division', 'girls')

console.log(`👧 Girls teams: ${girlsCount}`)

const { count: boysCount } = await supabase
  .from('tournament_teams')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .eq('division', 'boys')

console.log(`👦 Boys teams: ${boysCount}`)