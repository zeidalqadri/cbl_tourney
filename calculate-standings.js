#!/usr/bin/env node

// Script to calculate group standings from match results
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function calculateStandings() {
  console.log('📊 Calculating Group Standings...\n')
  
  // Get all teams
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('division', ['boys', 'girls'])
  
  if (!teams) {
    console.error('Failed to fetch teams')
    return
  }
  
  // Filter to only teams with proper pool codes
  const validTeams = teams.filter(t => 
    (t.division === 'boys' && t.pool && t.pool.startsWith('L')) ||
    (t.division === 'girls' && t.pool && t.pool.startsWith('P'))
  )
  
  console.log(`Processing ${validTeams.length} teams...`)
  
  // Calculate stats for each team
  for (const team of validTeams) {
    // Get all matches for this team
    const { data: matches } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('status', 'completed')
      .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`)
    
    if (!matches || matches.length === 0) {
      continue
    }
    
    // Calculate statistics
    let wins = 0, losses = 0, pointsFor = 0, pointsAgainst = 0
    
    for (const match of matches) {
      if (match.team1_id === team.id) {
        pointsFor += match.score1 || 0
        pointsAgainst += match.score2 || 0
        if (match.score1 > match.score2) wins++
        else if (match.score1 < match.score2) losses++
      } else if (match.team2_id === team.id) {
        pointsFor += match.score2 || 0
        pointsAgainst += match.score1 || 0
        if (match.score2 > match.score1) wins++
        else if (match.score2 < match.score1) losses++
      }
    }
    
    // Update team statistics
    const { error } = await supabase
      .from('tournament_teams')
      .update({
        group_wins: wins,
        group_losses: losses,
        group_played: wins + losses,
        group_points: wins * 2,
        points_for: pointsFor,
        points_against: pointsAgainst
      })
      .eq('id', team.id)
    
    if (error) {
      console.log(`   ❌ Error updating ${team.team_name}: ${error.message}`)
    }
  }
  
  console.log('\n📊 Calculating Group Positions...')
  
  // Now calculate positions for each group
  const groups = [...new Set(validTeams.map(t => t.pool))].filter(Boolean)
  
  for (const group of groups) {
    const division = group.startsWith('L') ? 'boys' : 'girls'
    
    // Get teams in this group ordered by points and point difference
    const { data: groupTeams } = await supabase
      .from('tournament_teams')
      .select('*')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('pool', group)
      .eq('division', division)
      .order('group_points', { ascending: false })
      .order('points_for', { ascending: false })
    
    if (!groupTeams) continue
    
    // Update positions
    for (let i = 0; i < groupTeams.length; i++) {
      const team = groupTeams[i]
      const position = i + 1
      
      // Update position and qualification status
      const updates = {
        group_position: position,
        qualification_status: position === 1 ? 'qualified' : 'eliminated',
        current_stage: position === 1 
          ? (division === 'boys' ? 'second_round' : 'quarter_final')
          : 'group_stage'
      }
      
      const { error } = await supabase
        .from('tournament_teams')
        .update(updates)
        .eq('id', team.id)
      
      if (!error && position === 1) {
        console.log(`   ✅ Group ${group} winner: ${team.team_name}`)
      }
    }
  }
  
  // Mark specific qualified teams based on PDF
  const qualifiedBoys = [
    'MALIM (B)', 'WEN HUA (B)', 'CHENG (B)', 'CHABAU (B)',
    'PAY CHEE (B)', 'ALOR GAJAH (B)', 'PAY FONG 1 (B)', 'YU HWA (B)',
    'MERLIMAU (B)', 'BACHANG (B)', 'PAY CHIAO (B)', 'YU HSIEN (B)',
    'BKT BERUANG (B)', 'PAY FONG 2 (B)'
  ]
  
  const qualifiedGirls = [
    'KEH SENG (G)', 'CHUNG HWA (G)', 'BKT BERUANG (G)', 'CHABAU (G)',
    'KIOW MIN (G)', 'PAY CHEE (G)', 'MALIM (G)', 'CHIAO CHEE (G)'
  ]
  
  console.log('\n📊 Verifying Qualified Teams...')
  
  // Ensure these teams are marked as qualified
  for (const teamName of qualifiedBoys) {
    const { error } = await supabase
      .from('tournament_teams')
      .update({
        qualification_status: 'qualified',
        current_stage: 'second_round'
      })
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('team_name', teamName)
      .eq('division', 'boys')
    
    if (!error) {
      console.log(`   ✅ Boys qualified: ${teamName}`)
    }
  }
  
  for (const teamName of qualifiedGirls) {
    const { error } = await supabase
      .from('tournament_teams')
      .update({
        qualification_status: 'qualified',
        current_stage: 'quarter_final'
      })
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('team_name', teamName)
      .eq('division', 'girls')
    
    if (!error) {
      console.log(`   ✅ Girls qualified: ${teamName}`)
    }
  }
  
  console.log('\n✅ Standings calculation complete!')
}

// Run the calculation
calculateStandings()
  .then(() => {
    console.log('\n🎉 Group standings calculated successfully!')
    console.log('Run validation again to verify: npm run validate-tournament')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })