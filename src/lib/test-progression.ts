// Test function to simulate tournament progression
// This can be used to manually mark teams as qualified for testing

import { supabase } from './supabase'

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

/**
 * Manually mark top teams from each group as qualified
 * This simulates the progression system for testing
 */
export async function simulateGroupWinners() {
  // Get all groups
  const groups = {
    boys: ['LB', 'LC', 'LD', 'LE', 'LG', 'LH', 'LI', 'LK', 'LL', 'LM', 'LN'],
    girls: ['PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH']
  }

  const results = []

  for (const [division, poolList] of Object.entries(groups)) {
    for (const pool of poolList) {
      // Get teams in this group
      const { data: teams, error } = await supabase
        .from('tournament_teams')
        .select('*')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('pool', pool)
        .eq('division', division)
        .limit(1) // Just get the first team to mark as winner

      if (error) {
        console.error(`Error getting teams for ${pool}:`, error)
        continue
      }

      if (teams && teams.length > 0) {
        const winner = teams[0]
        
        // Update team as qualified
        const { error: updateError } = await supabase
          .from('tournament_teams')
          .update({
            qualification_status: 'through',
            group_position: 1,
            current_stage: division === 'boys' ? 'second_round' : 'quarter_final',
            updated_at: new Date().toISOString()
          })
          .eq('id', winner.id)

        if (updateError) {
          console.error(`Error updating team ${winner.team_name}:`, updateError)
        } else {
          results.push({
            team: winner.team_name,
            pool,
            division,
            status: 'qualified'
          })
          console.log(`✅ Marked ${winner.team_name} as qualified from Group ${pool}`)
        }
      }
    }
  }

  return results
}

/**
 * Reset all qualification statuses
 */
export async function resetQualifications() {
  const { error } = await supabase
    .from('tournament_teams')
    .update({
      qualification_status: 'active',
      group_position: null,
      current_stage: 'group_stage',
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', TOURNAMENT_ID)

  if (error) {
    console.error('Error resetting qualifications:', error)
    return false
  }

  console.log('✅ Reset all team qualifications')
  return true
}

/**
 * Get current qualification status
 */
export async function getQualificationStatus() {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('team_name, pool, division, qualification_status, group_position, current_stage')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('qualification_status', 'through')

  if (error) {
    console.error('Error getting qualification status:', error)
    return []
  }

  return data || []
}