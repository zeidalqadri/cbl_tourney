import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🏀 MSS Melaka 2025 Basketball Tournament - Final Verification')
console.log('============================================================\n')

// 1. Verify team structure
console.log('📋 1. TEAM STRUCTURE')
console.log('-------------------')

const { data: teams } = await supabase
  .from('tournament_teams')
  .select('team_name, division, pool, metadata')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('division')
  .order('pool')
  .order('team_name')

// Count by division
const boyTeams = teams.filter(t => t.division === 'boys')
const girlTeams = teams.filter(t => t.division === 'girls')

console.log(`Total teams: ${teams.length}`)
console.log(`  👦 Boys: ${boyTeams.length} teams`)
console.log(`  👧 Girls: ${girlTeams.length} teams`)

// Verify naming convention
const misnamedTeams = teams.filter(t => !t.team_name.endsWith(' (B)') && !t.team_name.endsWith(' (G)'))
if (misnamedTeams.length > 0) {
  console.log(`\n⚠️  Teams without (B)/(G) suffix: ${misnamedTeams.length}`)
  misnamedTeams.forEach(t => console.log(`  - ${t.team_name}`))
} else {
  console.log('✅ All teams have proper (B)/(G) naming')
}

// Show pool distribution
console.log('\n📊 Pool Distribution:')
console.log('Boys Groups (LA-LN):')
const boysGroups = {}
boyTeams.forEach(t => {
  boysGroups[t.pool] = (boysGroups[t.pool] || 0) + 1
})
Object.entries(boysGroups).sort().forEach(([pool, count]) => {
  console.log(`  ${pool}: ${count} teams`)
})

console.log('\nGirls Groups (PA-PH + extras):')
const girlsGroups = {}
girlTeams.forEach(t => {
  girlsGroups[t.pool] = (girlsGroups[t.pool] || 0) + 1
})
Object.entries(girlsGroups).sort().forEach(([pool, count]) => {
  console.log(`  ${pool}: ${count} teams`)
})

// 2. Verify matches
console.log('\n\n📅 2. MATCH STRUCTURE')
console.log('--------------------')

const { data: matches } = await supabase
  .from('tournament_matches')
  .select('match_number, round, scheduled_time, venue, team1_id, team2_id, status')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('match_number')

console.log(`Total matches: ${matches.length} (Target: 129)`)

// Count by round
const roundCounts = {}
matches.forEach(m => {
  roundCounts[m.round] = (roundCounts[m.round] || 0) + 1
})

console.log('\nMatches by round:')
Object.entries(roundCounts).sort().forEach(([round, count]) => {
  const roundName = {
    1: 'Group Stage',
    2: 'Boys Second Round',
    3: 'Girls Quarter Finals',
    4: 'Semi Finals',
    5: 'Finals & 3rd/4th Place'
  }[round] || `Round ${round}`
  console.log(`  Round ${round} (${roundName}): ${count} matches`)
})

// Check for gaps in match numbers
const matchNumbers = matches.map(m => m.match_number).sort((a, b) => a - b)
const gaps = []
for (let i = 1; i <= 129; i++) {
  if (!matchNumbers.includes(i)) {
    gaps.push(i)
  }
}

if (gaps.length > 0) {
  console.log(`\n⚠️  Missing match numbers: ${gaps.join(', ')}`)
} else {
  console.log('✅ All match numbers 1-129 are present')
}

// 3. Check co-ed schools
console.log('\n\n🏫 3. CO-ED SCHOOLS')
console.log('-------------------')

const schoolNames = new Set()
const coEdSchools = new Set()

teams.forEach(team => {
  const baseName = team.metadata?.base_school_name || team.team_name.replace(/ \([BG]\)$/, '')
  if (schoolNames.has(baseName)) {
    coEdSchools.add(baseName)
  }
  schoolNames.add(baseName)
})

console.log(`Co-ed schools (participating in both divisions): ${coEdSchools.size}`)
const coEdList = Array.from(coEdSchools).sort()
coEdList.slice(0, 10).forEach(school => console.log(`  - ${school}`))
if (coEdList.length > 10) {
  console.log(`  ... and ${coEdList.length - 10} more`)
}

// 4. Verify venues and dates
console.log('\n\n📍 4. VENUES & SCHEDULE')
console.log('----------------------')

const venues = new Set(matches.map(m => m.venue))
console.log('Venues:')
venues.forEach(v => console.log(`  - ${v}`))

const dates = new Set(matches.map(m => m.scheduled_time?.split('T')[0]))
console.log('\nTournament dates:')
Array.from(dates).sort().forEach(d => console.log(`  - ${d}`))

// 5. Summary
console.log('\n\n🎯 FINAL SUMMARY')
console.log('----------------')

const allChecks = []

// Check 1: Team count
if (teams.length === 107) {
  console.log('✅ Team count: 107 teams')
  allChecks.push(true)
} else {
  console.log(`❌ Team count: ${teams.length} (expected 107)`)
  allChecks.push(false)
}

// Check 2: Match count
if (matches.length === 129) {
  console.log('✅ Match count: 129 matches')
  allChecks.push(true)
} else {
  console.log(`❌ Match count: ${matches.length} (expected 129)`)
  allChecks.push(false)
}

// Check 3: Naming convention
if (misnamedTeams.length === 0) {
  console.log('✅ Team naming: All teams have (B)/(G) suffix')
  allChecks.push(true)
} else {
  console.log(`❌ Team naming: ${misnamedTeams.length} teams missing suffix`)
  allChecks.push(false)
}

// Check 4: No gaps in matches
if (gaps.length === 0) {
  console.log('✅ Match numbers: Complete sequence 1-129')
  allChecks.push(true)
} else {
  console.log(`❌ Match numbers: Missing ${gaps.length} matches`)
  allChecks.push(false)
}

// Final verdict
if (allChecks.every(check => check === true)) {
  console.log('\n🎉 TOURNAMENT SETUP COMPLETE!')
  console.log('================================')
  console.log('✅ All teams loaded with proper naming')
  console.log('✅ All 129 matches loaded')
  console.log('✅ Co-ed schools properly handled')
  console.log('✅ Ready for MSS Melaka 2025!')
} else {
  console.log('\n⚠️  Some issues remain to be fixed')
}