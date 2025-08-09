#!/usr/bin/env node

// Script to update knockout matches with actual qualified teams
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

async function updateKnockoutTeams() {
  console.log('🏀 Updating Knockout Stage Teams...\n')
  
  // Get all qualified teams (group winners)
  const { data: qualifiedTeams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('group_position', 1)
    .in('division', ['boys', 'girls'])
  
  if (!qualifiedTeams) {
    console.error('Failed to fetch qualified teams')
    return
  }
  
  console.log(`Found ${qualifiedTeams.length} qualified teams\n`)
  
  // Create mapping of placeholder names to actual teams
  const teamMapping = {}
  
  qualifiedTeams.forEach(team => {
    if (team.pool && team.division) {
      const placeholderName = team.division === 'boys' 
        ? `Winner Group ${team.pool}`
        : `Champion ${team.pool}`
      
      teamMapping[placeholderName] = team
      console.log(`   ${placeholderName} → ${team.team_name}`)
    }
  })
  
  console.log('\n📊 Updating Knockout Matches...')
  
  // Get all knockout matches
  const { data: knockoutMatches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('round', [2, 3, 4, 5]) // Second round, quarter-finals, semi-finals, finals
  
  if (!knockoutMatches) {
    console.error('Failed to fetch knockout matches')
    return
  }
  
  console.log(`Found ${knockoutMatches.length} knockout matches to update\n`)
  
  let updateCount = 0
  let errorCount = 0
  
  for (const match of knockoutMatches) {
    let updates = {}
    let needsUpdate = false
    
    // Check if team1 is a placeholder
    if (match.team1?.team_name?.includes('Winner') || match.team1?.team_name?.includes('Champion')) {
      const actualTeam = teamMapping[match.team1.team_name.replace(' (KNOCKOUT)', '')]
      if (actualTeam) {
        updates.team1_id = actualTeam.id
        needsUpdate = true
        console.log(`   Match #${match.match_number}: Team 1 ${match.team1.team_name} → ${actualTeam.team_name}`)
      }
    }
    
    // Check if team2 is a placeholder
    if (match.team2?.team_name?.includes('Winner') || match.team2?.team_name?.includes('Champion')) {
      const actualTeam = teamMapping[match.team2.team_name.replace(' (KNOCKOUT)', '')]
      if (actualTeam) {
        updates.team2_id = actualTeam.id
        needsUpdate = true
        console.log(`   Match #${match.match_number}: Team 2 ${match.team2.team_name} → ${actualTeam.team_name}`)
      }
    }
    
    // Update the match if needed
    if (needsUpdate) {
      const { error } = await supabase
        .from('tournament_matches')
        .update(updates)
        .eq('id', match.id)
      
      if (error) {
        console.error(`   ❌ Error updating match #${match.match_number}: ${error.message}`)
        errorCount++
      } else {
        updateCount++
      }
    }
  }
  
  // Also delete the placeholder teams from the database
  console.log('\n🧹 Cleaning up placeholder teams...')
  
  const { error: deleteError } = await supabase
    .from('tournament_teams')
    .delete()
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('pool', 'KNOCKOUT')
  
  if (deleteError) {
    console.error(`   ❌ Error deleting placeholder teams: ${deleteError.message}`)
  } else {
    console.log('   ✅ Placeholder teams removed')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('UPDATE SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated: ${updateCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  console.log('\n✅ Knockout stage teams updated!')
}

// Run the update
updateKnockoutTeams()
  .then(() => {
    console.log('\n🎉 Knockout teams updated successfully!')
    console.log('The frontend should now show actual team names instead of placeholders.')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })