import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read environment variables
const envPath = path.join(__dirname, '.env.production')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugMatches() {
  console.log('Debugging match fetching...')
  
  // 1. First check raw matches without joins
  const { data: rawMatches, error: rawError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .gte('scheduled_time', '2025-08-06')
    .lte('scheduled_time', '2025-08-08')
    .order('match_number')
  
  if (rawError) {
    console.error('Raw query error:', rawError)
    return
  }
  
  console.log(`\nRaw matches found: ${rawMatches.length}`)
  console.log('Sample raw match:', JSON.stringify(rawMatches[0], null, 2))
  
  // 2. Now check with team joins (like the app does)
  const { data: joinedMatches, error: joinError } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .gte('scheduled_time', '2025-08-06')
    .lte('scheduled_time', '2025-08-08')
    .order('match_number')
  
  if (joinError) {
    console.error('Joined query error:', joinError)
    return
  }
  
  console.log(`\nJoined matches found: ${joinedMatches.length}`)
  console.log('Sample joined match:', JSON.stringify(joinedMatches[0], null, 2))
  
  // 3. Check if placeholder teams exist
  const { data: placeholderTeams, error: teamError } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('pool', 'KNOCKOUT')
    .limit(5)
  
  if (teamError) {
    console.error('Team query error:', teamError)
  } else {
    console.log(`\nPlaceholder teams found: ${placeholderTeams.length}`)
    if (placeholderTeams.length > 0) {
      console.log('Sample placeholder team:', JSON.stringify(placeholderTeams[0], null, 2))
    }
  }
  
  // 4. Test the exact query the app uses
  console.log('\nTesting app query...')
  let appQuery = supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .order('match_number', { ascending: true })
  
  const { data: appMatches, error: appError } = await appQuery
  
  if (appError) {
    console.error('App query error:', appError)
  } else {
    // Filter for knockout days
    const knockoutMatches = appMatches.filter(m => {
      const date = new Date(m.scheduled_time).toISOString().split('T')[0]
      return date === '2025-08-06' || date === '2025-08-07'
    })
    
    console.log(`App query - total matches: ${appMatches.length}`)
    console.log(`App query - knockout matches: ${knockoutMatches.length}`)
    
    // Group by date
    const byDate = {}
    knockoutMatches.forEach(m => {
      const date = new Date(m.scheduled_time).toISOString().split('T')[0]
      byDate[date] = (byDate[date] || 0) + 1
    })
    
    console.log('\nMatches by date from app query:')
    Object.entries(byDate).forEach(([date, count]) => {
      console.log(`  ${date}: ${count} matches`)
    })
  }
}

debugMatches()