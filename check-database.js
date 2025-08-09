// Script to check existing database tables and schema
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkDatabase() {
  console.log('🔍 Checking existing database schema...\n')

  // Check tournaments table
  console.log('📊 Checking tournaments table...')
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
  
  if (tournamentsError) {
    console.log('❌ tournaments table error:', tournamentsError.message)
  } else {
    console.log('✅ tournaments table exists')
    console.log('   Sample data:', tournaments?.[0] ? 'Found' : 'Empty')
  }

  // Check tournament_teams table
  console.log('\n📊 Checking tournament_teams table...')
  const { data: teams, error: teamsError } = await supabase
    .from('tournament_teams')
    .select('*')
    .limit(5)
  
  if (teamsError) {
    console.log('❌ tournament_teams table error:', teamsError.message)
  } else {
    console.log('✅ tournament_teams table exists')
    console.log(`   Total teams fetched: ${teams?.length || 0}`)
    if (teams?.[0]) {
      console.log('   Columns:', Object.keys(teams[0]).join(', '))
    }
  }

  // Check tournament_matches table
  console.log('\n📊 Checking tournament_matches table...')
  const { data: matches, error: matchesError } = await supabase
    .from('tournament_matches')
    .select('*')
    .limit(5)
  
  if (matchesError) {
    console.log('❌ tournament_matches table error:', matchesError.message)
  } else {
    console.log('✅ tournament_matches table exists')
    console.log(`   Total matches fetched: ${matches?.length || 0}`)
    if (matches?.[0]) {
      console.log('   Columns:', Object.keys(matches[0]).join(', '))
    }
  }

  // Check tournament_progression table
  console.log('\n📊 Checking tournament_progression table...')
  const { data: progression, error: progressionError } = await supabase
    .from('tournament_progression')
    .select('*')
    .limit(1)
  
  if (progressionError) {
    console.log('❌ tournament_progression table error:', progressionError.message)
  } else {
    console.log('✅ tournament_progression table exists')
  }

  // Count existing data
  console.log('\n📈 Data Summary:')
  
  // Count teams
  const { count: teamCount } = await supabase
    .from('tournament_teams')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  
  console.log(`   Total teams: ${teamCount || 0}`)

  // Count matches
  const { count: matchCount } = await supabase
    .from('tournament_matches')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
  
  console.log(`   Total matches: ${matchCount || 0}`)

  // Check for specific columns
  console.log('\n🔧 Checking for required columns...')
  
  if (teams?.[0]) {
    const teamColumns = Object.keys(teams[0])
    console.log('tournament_teams columns present:')
    console.log('   - qualification_status:', teamColumns.includes('qualification_status') ? '✅' : '❌ Missing')
    console.log('   - current_stage:', teamColumns.includes('current_stage') ? '✅' : '❌ Missing')
    console.log('   - final_position:', teamColumns.includes('final_position') ? '✅' : '❌ Missing')
  }

  if (matches?.[0]) {
    const matchColumns = Object.keys(matches[0])
    console.log('\ntournament_matches columns present:')
    console.log('   - metadata:', matchColumns.includes('metadata') ? '✅' : '❌ Missing')
    console.log('   - is_qualification_match:', matchColumns.includes('is_qualification_match') ? '✅' : '❌ Missing')
    console.log('   - advances_to_match_id:', matchColumns.includes('advances_to_match_id') ? '✅' : '❌ Missing')
  }
}

checkDatabase().catch(console.error)