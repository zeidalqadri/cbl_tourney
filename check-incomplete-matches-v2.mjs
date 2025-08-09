import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tnglzpywvtafomngxsgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'
)

async function checkIncompleteMatches() {
  console.log('🔍 Checking for incomplete matches...\n')

  // Get today's date in UTC
  const today = new Date().toISOString().split('T')[0]
  console.log(`Today's date: ${today}\n`)

  // Check all matches with 0-0 scores or null scores
  const { data: incompleteMatches, error } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
      team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
    `)
    .or('and(score1.eq.0,score2.eq.0),and(score1.is.null,score2.is.null)')
    .order('scheduled_time', { ascending: true })
    .order('match_number', { ascending: true })

  if (error) {
    console.error('Error fetching incomplete matches:', error)
    return
  }

  console.log(`Found ${incompleteMatches?.length || 0} incomplete matches:\n`)

  // Group by date
  const matchesByDate = {}
  incompleteMatches?.forEach(match => {
    const date = match.scheduled_time ? match.scheduled_time.split('T')[0] : 'No date'
    if (!matchesByDate[date]) {
      matchesByDate[date] = []
    }
    matchesByDate[date].push(match)
  })

  // Display matches grouped by date
  Object.entries(matchesByDate).forEach(([date, matches]) => {
    if (date === 'No date') {
      console.log(`\n📅 No scheduled date`)
    } else {
      const dateObj = new Date(date)
      const isToday = date === today
      const isPast = date < today
      const isFuture = date > today
      
      let dateStatus = ''
      if (isToday) dateStatus = ' (TODAY)'
      else if (isPast) dateStatus = ' (PAST - NEEDS UPDATE)'
      else if (isFuture) dateStatus = ' (FUTURE)'

      console.log(`\n📅 ${dateObj.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${dateStatus}`)
    }
    console.log('─'.repeat(80))
    
    matches.forEach(match => {
      const team1Name = match.team1?.team_name || match.metadata?.team1_placeholder || 'Unknown'
      const team2Name = match.team2?.team_name || match.metadata?.team2_placeholder || 'Unknown'
      
      console.log(`Match #${match.match_number}: ${team1Name} vs ${team2Name}`)
      console.log(`  Status: ${match.status} | Round: ${match.round}`)
      console.log(`  Score: ${match.score1 ?? 0} - ${match.score2 ?? 0}`)
      console.log(`  Venue: ${match.venue || match.court || 'TBD'}`)
      if (match.metadata?.division) console.log(`  Division: ${match.metadata.division}`)
    })
  })

  // Summary
  console.log('\n\n📊 SUMMARY:')
  console.log('─'.repeat(80))
  const pastMatches = incompleteMatches?.filter(m => {
    const matchDate = m.scheduled_time ? m.scheduled_time.split('T')[0] : null
    return matchDate && matchDate < today
  }) || []
  const todayMatches = incompleteMatches?.filter(m => {
    const matchDate = m.scheduled_time ? m.scheduled_time.split('T')[0] : null
    return matchDate === today
  }) || []
  const futureMatches = incompleteMatches?.filter(m => {
    const matchDate = m.scheduled_time ? m.scheduled_time.split('T')[0] : null
    return matchDate && matchDate > today
  }) || []

  console.log(`Past matches needing scores: ${pastMatches.length}`)
  console.log(`Today's matches: ${todayMatches.length}`)
  console.log(`Future matches: ${futureMatches.length}`)
  console.log(`\nTotal incomplete matches: ${incompleteMatches?.length || 0}`)

  // Show only past matches that are pending or in_progress
  const unscoredPastMatches = pastMatches.filter(m => 
    m.status === 'pending' || m.status === 'in_progress' || 
    (m.status === 'completed' && (m.score1 === 0 || m.score1 === null) && (m.score2 === 0 || m.score2 === null))
  )
  
  if (unscoredPastMatches.length > 0) {
    console.log(`\n⚠️  ATTENTION: ${unscoredPastMatches.length} past matches need scores!`)
  }
}

checkIncompleteMatches().catch(console.error)