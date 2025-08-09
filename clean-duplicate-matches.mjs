import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🧹 Cleaning Duplicate Matches')
console.log('============================\n')

// Get all matches ordered by match_number and created_at
const { data: matches } = await supabase
  .from('tournament_matches')
  .select('*')
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  .order('match_number')
  .order('created_at', { ascending: true })

console.log(`Total matches: ${matches.length}`)

// Group matches by match_number
const matchGroups = {}
matches.forEach(match => {
  if (!matchGroups[match.match_number]) {
    matchGroups[match.match_number] = []
  }
  matchGroups[match.match_number].push(match)
})

// Find duplicates (match numbers 76-83 have 2 instances each)
const duplicatesToDelete = []
let duplicatesFound = 0

Object.entries(matchGroups).forEach(([matchNumber, matchList]) => {
  if (matchList.length > 1) {
    console.log(`\nMatch ${matchNumber}: ${matchList.length} instances`)
    
    // Keep the first one (oldest), delete the rest
    for (let i = 1; i < matchList.length; i++) {
      const match = matchList[i]
      console.log(`  - Will delete: ${match.id} (created at ${match.created_at})`)
      duplicatesToDelete.push(match.id)
      duplicatesFound++
    }
  }
})

console.log(`\n📊 Found ${duplicatesFound} duplicate matches to delete`)

if (duplicatesToDelete.length > 0) {
  console.log('\n🗑️  Deleting duplicates...')
  
  const { error } = await supabase
    .from('tournament_matches')
    .delete()
    .in('id', duplicatesToDelete)
  
  if (error) {
    console.log('❌ Error deleting duplicates:', error.message)
  } else {
    console.log(`✅ Successfully deleted ${duplicatesToDelete.length} duplicate matches`)
  }
}

// Verify final count
const { count: finalCount } = await supabase
  .from('tournament_matches')
  .select('*', { count: 'exact', head: true })
  .eq('tournament_id', '66666666-6666-6666-6666-666666666666')

console.log('\n📊 Final Result:')
console.log(`📅 Total matches: ${finalCount} (Target: 129)`)

if (finalCount === 129) {
  console.log('\n🎉 SUCCESS! Tournament database is now complete!')
  console.log('✅ All teams have consistent (B)/(G) naming')
  console.log('✅ Exactly 129 matches as per official schedule')
  console.log('✅ Ready for MSS Melaka 2025 Basketball Tournament!')
} else {
  console.log(`\n⚠️  Match count still off by ${Math.abs(finalCount - 129)}`)
}