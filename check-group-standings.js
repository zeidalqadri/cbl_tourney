#!/usr/bin/env node

// Script to check group standings and positions
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function checkGroupStandings() {
  console.log('📊 Checking Group Standings...\n')
  
  // Get all teams with their standings
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('division', ['boys', 'girls'])
    .order('pool', { ascending: true })
    .order('group_position', { ascending: true })
  
  if (!teams) {
    console.error('Failed to fetch teams')
    return
  }
  
  // Group teams by pool
  const groups = {}
  teams.forEach(team => {
    if (!team.pool) return
    if (!groups[team.pool]) {
      groups[team.pool] = []
    }
    groups[team.pool].push(team)
  })
  
  // Display standings for each group
  console.log('Boys Division Groups:')
  console.log('='.repeat(60))
  
  for (const group of Object.keys(groups).sort()) {
    if (group.startsWith('L')) {
      console.log(`\nGroup ${group}:`)
      const groupTeams = groups[group].sort((a, b) => {
        // Sort by position if available, otherwise by points
        if (a.group_position && b.group_position) {
          return a.group_position - b.group_position
        }
        return (b.group_points || 0) - (a.group_points || 0)
      })
      
      groupTeams.forEach((team, idx) => {
        const pos = team.group_position || (idx + 1)
        const status = pos === 1 ? '✅' : '  '
        console.log(`   ${status} ${pos}. ${team.team_name}: ${team.group_wins || 0}W-${team.group_losses || 0}L, ${team.points_for || 0}-${team.points_against || 0} pts`)
        if (pos === 1) {
          console.log(`      → Qualification: ${team.qualification_status || 'not set'}`)
        }
      })
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Girls Division Groups:')
  console.log('='.repeat(60))
  
  for (const group of Object.keys(groups).sort()) {
    if (group.startsWith('P')) {
      console.log(`\nGroup ${group}:`)
      const groupTeams = groups[group].sort((a, b) => {
        if (a.group_position && b.group_position) {
          return a.group_position - b.group_position
        }
        return (b.group_points || 0) - (a.group_points || 0)
      })
      
      groupTeams.forEach((team, idx) => {
        const pos = team.group_position || (idx + 1)
        const status = pos === 1 ? '✅' : '  '
        console.log(`   ${status} ${pos}. ${team.team_name}: ${team.group_wins || 0}W-${team.group_losses || 0}L, ${team.points_for || 0}-${team.points_against || 0} pts`)
        if (pos === 1) {
          console.log(`      → Qualification: ${team.qualification_status || 'not set'}`)
        }
      })
    }
  }
  
  // Check for teams without positions
  console.log('\n' + '='.repeat(60))
  console.log('Teams without group positions:')
  const teamsWithoutPositions = teams.filter(t => !t.group_position && t.pool)
  console.log(`Found ${teamsWithoutPositions.length} teams without positions`)
  
  if (teamsWithoutPositions.length > 0) {
    teamsWithoutPositions.forEach(team => {
      console.log(`   - ${team.team_name} (${team.pool}): ${team.group_wins || 0}W-${team.group_losses || 0}L`)
    })
  }
}

// Run the check
checkGroupStandings()
  .then(() => {
    console.log('\n✅ Group standings check complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })