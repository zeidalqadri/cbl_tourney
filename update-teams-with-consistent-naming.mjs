import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🏫 Updating Teams with Consistent (B)/(G) Naming')
console.log('===============================================\n')

// Get all teams
const { data: teams } = await supabase
  .from('tournament_teams')
  .select('id, team_name, division, metadata')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('team_name')

console.log(`Found ${teams.length} teams to update\n`)

// Group teams by base name to identify co-ed schools
const schoolTeams = {}
teams.forEach(team => {
  // Extract base name (remove any existing suffixes)
  const baseName = team.team_name.replace(/\s*\([GB]\)\s*$/, '')
  
  if (!schoolTeams[baseName]) {
    schoolTeams[baseName] = []
  }
  schoolTeams[baseName].push(team)
})

// Identify co-ed schools
const coEdSchools = Object.entries(schoolTeams)
  .filter(([name, teams]) => {
    const hasBoys = teams.some(t => t.division === 'boys')
    const hasGirls = teams.some(t => t.division === 'girls')
    return hasBoys && hasGirls
  })
  .map(([name]) => name)

console.log(`Found ${coEdSchools.length} co-ed schools:`)
coEdSchools.forEach(school => console.log(`  - ${school}`))

// Update all teams
console.log('\n📝 Updating team names and metadata...')
let updated = 0
let errors = 0

for (const team of teams) {
  const baseName = team.team_name.replace(/\s*\([GB]\)\s*$/, '')
  
  // Create display name with (B) or (G) suffix
  const displayName = `${baseName} (${team.division === 'boys' ? 'B' : 'G'})`
  
  // Update metadata
  const isCoEd = coEdSchools.includes(baseName)
  const metadata = {
    ...team.metadata,
    school_type: isCoEd ? 'co_ed' : `${team.division}_only`,
    base_school_name: baseName,
    display_name: displayName
  }
  
  // Update the team_name to include the suffix
  const { error } = await supabase
    .from('tournament_teams')
    .update({ 
      team_name: displayName,  // Update team_name to include suffix
      metadata
    })
    .eq('id', team.id)
  
  if (error) {
    console.log(`❌ Error updating ${team.team_name}:`, error.message)
    errors++
  } else {
    if (team.team_name !== displayName) {
      console.log(`✅ ${team.team_name} → ${displayName}`)
    } else {
      console.log(`✅ ${displayName} (metadata updated)`)
    }
    updated++
  }
}

console.log(`\n📊 Update Summary:`)
console.log(`✅ Successfully updated: ${updated} teams`)
console.log(`❌ Errors: ${errors}`)

// Clean up duplicate matches
console.log('\n🧹 Cleaning up duplicate matches...')

const { data: matches } = await supabase
  .from('tournament_matches')
  .select('id, match_number, round, team1_id, team2_id')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('match_number')

// Find true duplicates (same match_number AND round)
const seen = new Map()
const duplicates = []

matches.forEach(match => {
  const key = `${match.match_number}-${match.round}`
  if (seen.has(key)) {
    duplicates.push(match.id)
    console.log(`  Duplicate found: Match ${match.match_number} Round ${match.round}`)
  } else {
    seen.set(key, match)
  }
})

console.log(`Found ${duplicates.length} duplicate matches`)

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
const { count: finalMatchCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log(`\n📊 Final Status:`)
console.log(`📅 Total matches: ${finalMatchCount} (Target: 129)`)

if (finalMatchCount === 129) {
  console.log('\n🎉 SUCCESS! Database is now properly configured!')
  console.log('✅ All teams have consistent (B)/(G) naming')
  console.log('✅ Exactly 129 matches as per tournament schedule')
} else if (finalMatchCount < 129) {
  console.log(`\n⚠️  Missing ${129 - finalMatchCount} matches`)
} else {
  console.log(`\n⚠️  Have ${finalMatchCount - 129} extra matches`)
  
  // Show which matches are extra
  if (finalMatchCount > 129) {
    console.log('\n📋 Analyzing extra matches...')
    const matchCounts = {}
    matches.forEach(m => {
      matchCounts[m.match_number] = (matchCounts[m.match_number] || 0) + 1
    })
    
    Object.entries(matchCounts)
      .filter(([num, count]) => count > 1)
      .forEach(([num, count]) => {
        console.log(`  Match ${num}: ${count} instances`)
      })
  }
}

// Show sample of updated teams
console.log('\n📋 Sample of updated teams:')
const { data: sampleTeams } = await supabase
  .from('tournament_teams')
  .select('team_name, division, metadata')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .limit(10)

sampleTeams.forEach(team => {
  console.log(`  ${team.team_name} - ${team.metadata?.school_type || 'unknown'}`)
})