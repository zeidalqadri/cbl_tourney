import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tnglzpywvtafomngxsgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'
)

async function checkIncompleteMatches() {
  console.log('🔍 Checking for incomplete matches...\n')

  // Get today's date
  const today = new Date().toISOString().split('T')[0]
  console.log(`Today's date: ${today}\n`)

  // Check all matches with 0-0 scores
  const { data: zeroScoreMatches, error: zeroError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('score_a', 0)
    .eq('score_b', 0)
    .order('scheduled_date', { ascending: true })
    .order('match_number', { ascending: true })

  if (zeroError) {
    console.error('Error fetching zero score matches:', zeroError)
    return
  }

  console.log(`Found ${zeroScoreMatches?.length || 0} matches with 0-0 scores:\n`)

  // Group by date
  const matchesByDate = {}
  zeroScoreMatches?.forEach(match => {
    const date = match.scheduled_date
    if (!matchesByDate[date]) {
      matchesByDate[date] = []
    }
    matchesByDate[date].push(match)
  })

  // Display matches grouped by date
  Object.entries(matchesByDate).forEach(([date, matches]) => {
    const dateObj = new Date(date)
    const isToday = date === today
    const isPast = date < today
    const isFuture = date > today
    
    let dateStatus = ''
    if (isToday) dateStatus = ' (TODAY)'
    else if (isPast) dateStatus = ' (PAST - NEEDS UPDATE)'
    else if (isFuture) dateStatus = ' (FUTURE)'

    console.log(`\n📅 ${dateObj.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${dateStatus}`)
    console.log('─'.repeat(80))
    
    matches.forEach(match => {
      console.log(`Match #${match.match_number}: Team A ID: ${match.team_a_id} vs Team B ID: ${match.team_b_id}`)
      console.log(`  Status: ${match.status} | Stage: ${match.stage} | Round: ${match.round || 'N/A'}`)
      console.log(`  Score: ${match.score_a} - ${match.score_b}`)
      if (match.venue) console.log(`  Venue: ${match.venue}`)
    })
  })

  // Summary
  console.log('\n\n📊 SUMMARY:')
  console.log('─'.repeat(80))
  const pastMatches = zeroScoreMatches?.filter(m => m.scheduled_date < today) || []
  const todayMatches = zeroScoreMatches?.filter(m => m.scheduled_date === today) || []
  const futureMatches = zeroScoreMatches?.filter(m => m.scheduled_date > today) || []

  console.log(`Past matches needing scores: ${pastMatches.length}`)
  console.log(`Today's matches: ${todayMatches.length}`)
  console.log(`Future matches: ${futureMatches.length}`)
  console.log(`\nTotal matches with 0-0 scores: ${zeroScoreMatches?.length || 0}`)
}

checkIncompleteMatches().catch(console.error)