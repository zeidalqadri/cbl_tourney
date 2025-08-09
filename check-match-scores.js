#!/usr/bin/env node

// Script to check match scores and status
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function checkMatchScores() {
  console.log('🏀 Checking Match Scores and Status...\n')
  
  // Get matches for today (August 6, 2025)
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(team_name), team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 102)
    .lte('match_number', 123)
    .order('match_number', { ascending: true })
  
  if (!matches) {
    console.error('Failed to fetch matches')
    return
  }
  
  console.log('Knockout Matches (August 6, 2025):')
  console.log('='.repeat(80))
  console.log('Match# | Team 1                  | Score | Team 2                  | Status')
  console.log('-'.repeat(80))
  
  matches.forEach(match => {
    const team1 = (match.team1?.team_name || 'TBD').padEnd(20)
    const team2 = (match.team2?.team_name || 'TBD').padEnd(20)
    const score1 = match.score1 !== null ? match.score1.toString().padStart(3) : ' - '
    const score2 = match.score2 !== null ? match.score2.toString().padStart(3) : ' - '
    const status = match.status.padEnd(10)
    const winner = match.status === 'completed' && match.score1 !== null && match.score2 !== null
      ? (match.score1 > match.score2 ? '← WIN' : match.score2 > match.score1 ? 'WIN →' : 'TIE')
      : ''
    
    console.log(`#${match.match_number.toString().padEnd(5)} | ${team1} | ${score1}-${score2} | ${team2} | ${status} ${winner}`)
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('Status Summary:')
  
  const statusCounts = matches.reduce((acc, match) => {
    acc[match.status] = (acc[match.status] || 0) + 1
    return acc
  }, {})
  
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} matches`)
  })
  
  // Check for completed matches without proper scores
  const completedNoScores = matches.filter(m => 
    m.status === 'completed' && (m.score1 === null || m.score2 === null)
  )
  
  if (completedNoScores.length > 0) {
    console.log('\n⚠️  WARNING: Completed matches without scores:')
    completedNoScores.forEach(match => {
      console.log(`   Match #${match.match_number}: ${match.team1?.team_name} vs ${match.team2?.team_name}`)
    })
  }
  
  // Sample some completed matches to verify winner display
  const completedMatches = matches.filter(m => 
    m.status === 'completed' && m.score1 !== null && m.score2 !== null
  )
  
  if (completedMatches.length > 0) {
    console.log('\n✅ Sample Completed Matches (should show winner highlighting):')
    completedMatches.slice(0, 5).forEach(match => {
      const winner = match.score1 > match.score2 
        ? match.team1?.team_name 
        : match.team2?.team_name
      console.log(`   Match #${match.match_number}: ${winner} won (${match.score1}-${match.score2})`)
    })
  }
}

// Run the check
checkMatchScores()
  .then(() => {
    console.log('\n✅ Score check complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })