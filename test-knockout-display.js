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

async function testKnockoutDisplay() {
  try {
    console.log('Checking knockout matches...')
    
    // Check all matches for Day 3 and Day 4
    const { data: allMatches, error } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        team1:tournament_teams!tournament_matches_team1_id_fkey(team_name, division),
        team2:tournament_teams!tournament_matches_team2_id_fkey(team_name, division)
      `)
      .gte('scheduled_time', '2025-08-06')
      .lte('scheduled_time', '2025-08-08')
      .order('scheduled_time')
    
    if (error) {
      console.error('Error fetching matches:', error)
      return
    }
    
    // Group by date
    const matchesByDate = {}
    allMatches.forEach(match => {
      const date = new Date(match.scheduled_time).toISOString().split('T')[0]
      if (!matchesByDate[date]) {
        matchesByDate[date] = []
      }
      matchesByDate[date].push(match)
    })
    
    console.log('\nMatches by date:')
    Object.entries(matchesByDate).forEach(([date, matches]) => {
      console.log(`\n${date}: ${matches.length} matches`)
      
      // Count by round
      const roundCounts = {}
      matches.forEach(match => {
        const roundName = match.metadata?.type || `Round ${match.round}`
        roundCounts[roundName] = (roundCounts[roundName] || 0) + 1
      })
      
      Object.entries(roundCounts).forEach(([round, count]) => {
        console.log(`  - ${round}: ${count} matches`)
      })
      
      // Show first few matches
      console.log('  Sample matches:')
      matches.slice(0, 3).forEach(match => {
        const team1Name = match.team1?.team_name || 'TBD'
        const team2Name = match.team2?.team_name || 'TBD'
        console.log(`    Match #${match.match_number}: ${team1Name} vs ${team2Name}`)
      })
    })
    
    console.log('\n✅ Test complete. The UI should now display:')
    console.log('- Day 3 button showing actual match count (not "TBD")')
    console.log('- Day 4 button showing actual match count (not "TBD")')
    console.log('- Match cards with placeholder team names in italic gray text')
    console.log('\nOnce you run the SQL script in Supabase, these matches will appear automatically.')
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testKnockoutDisplay()