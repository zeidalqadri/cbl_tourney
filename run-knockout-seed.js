import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read environment variables from .env.production
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

async function runKnockoutSeed() {
  try {
    console.log('Reading knockout matches SQL...')
    const sql = fs.readFileSync(
      path.join(__dirname, 'supabase', 'seed-knockout-matches.sql'),
      'utf8'
    )
    
    // Since we can't execute raw SQL directly, let's output instructions
    console.log('\nTo create knockout matches, please run the SQL manually:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of supabase/seed-knockout-matches.sql')
    console.log('4. Click "Run"')
    console.log('\nThe SQL script will create:')
    console.log('- 18 boys second round matches (Day 3)')
    console.log('- 4 girls quarter-final matches (Day 3)')
    console.log('- 2 boys semi-final matches (Day 4)')
    console.log('- 2 girls semi-final matches (Day 4)')
    console.log('- 1 boys final match (Day 4)')
    console.log('- 1 girls final match (Day 4)')
    
    // Check the results
    console.log('\nChecking knockout matches...')
    const { data: knockoutMatches, error: fetchError } = await supabase
      .from('tournament_matches')
      .select(`
        match_number,
        round,
        scheduled_time,
        team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
        team2:tournament_teams!tournament_matches_team2_id_fkey(team_name),
        metadata
      `)
      .gte('round', 2)
      .order('match_number')
    
    if (fetchError) {
      console.error('Error fetching matches:', fetchError)
      return
    }
    
    console.log(`\nFound ${knockoutMatches.length} knockout matches:`)
    
    // Group by day
    const day3Matches = knockoutMatches.filter(m => 
      new Date(m.scheduled_time).toISOString().startsWith('2025-08-06')
    )
    const day4Matches = knockoutMatches.filter(m => 
      new Date(m.scheduled_time).toISOString().startsWith('2025-08-07')
    )
    
    console.log(`- Day 3 (Knockout): ${day3Matches.length} matches`)
    console.log(`- Day 4 (Finals): ${day4Matches.length} matches`)
    
    // Show some sample matches
    console.log('\nSample knockout matches:')
    knockoutMatches.slice(0, 5).forEach(match => {
      console.log(`  Match #${match.match_number}: ${match.team1.team_name} vs ${match.team2.team_name}`)
    })
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

runKnockoutSeed()