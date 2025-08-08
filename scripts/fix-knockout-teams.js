#!/usr/bin/env node

/**
 * Script to populate knockout matches with qualified teams from group stage
 * This checks for completed group stages and updates knockout matches with actual team IDs
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getGroupStandings(groupName, division) {
  // Get all teams in the group
  const { data: teams, error: teamsError } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('pool', groupName)
    .eq('division', division)
  
  if (teamsError) throw teamsError
  
  // Get all matches for these teams
  const teamIds = teams?.map(t => t.id) || []
  const { data: matches, error: matchesError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 1) // Group stage
    .or(`team1_id.in.(${teamIds.join(',')}),team2_id.in.(${teamIds.join(',')})`)
    .eq('status', 'completed')
  
  if (matchesError) throw matchesError
  
  // Calculate standings
  const standings = teams.map(team => {
    let played = 0
    let won = 0
    let lost = 0
    let pointsFor = 0
    let pointsAgainst = 0
    
    matches?.forEach(match => {
      if (match.team1_id === team.id) {
        played++
        pointsFor += match.score1 || 0
        pointsAgainst += match.score2 || 0
        if ((match.score1 || 0) > (match.score2 || 0)) won++
        else lost++
      } else if (match.team2_id === team.id) {
        played++
        pointsFor += match.score2 || 0
        pointsAgainst += match.score1 || 0
        if ((match.score2 || 0) > (match.score1 || 0)) won++
        else lost++
      }
    })
    
    return {
      team_id: team.id,
      team_name: team.team_name,
      division: team.division,
      pool: team.pool,
      played,
      won,
      lost,
      points_for: pointsFor,
      points_against: pointsAgainst,
      points_difference: pointsFor - pointsAgainst,
      win_percentage: played > 0 ? (won / played) : 0
    }
  })
  
  // Sort by win percentage, then points difference
  standings.sort((a, b) => {
    if (b.win_percentage !== a.win_percentage) {
      return b.win_percentage - a.win_percentage
    }
    return b.points_difference - a.points_difference
  })
  
  return standings
}

async function checkGroupComplete(groupName, division) {
  const { data: matches, error } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 1)
    .eq('metadata->>group', groupName)
    .neq('status', 'completed')
  
  if (error) throw error
  
  // Check if there are any non-completed matches for this group
  const groupMatches = matches?.filter(m => 
    m.team1?.pool === groupName || m.team2?.pool === groupName ||
    m.metadata?.group === groupName
  ) || []
  
  return groupMatches.length === 0
}

async function updateKnockoutMatch(matchId, team1Id, team2Id) {
  const updates = {}
  if (team1Id) updates.team1_id = team1Id
  if (team2Id) updates.team2_id = team2Id
  
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
    
    if (error) {
      console.error(`Error updating match ${matchId}:`, error)
      return false
    }
    return true
  }
  return false
}

async function fixKnockoutTeams() {
  console.log('🏀 Checking and updating knockout matches with qualified teams...\n')
  
  try {
    // Process boys division
    console.log('📘 BOYS DIVISION')
    console.log('================')
    
    const boysGroups = ['LB', 'LC', 'LD', 'LE', 'LG', 'LH', 'LI', 'LK', 'LL', 'LM', 'LN']
    const boysQualified = new Map()
    
    for (const group of boysGroups) {
      const isComplete = await checkGroupComplete(group, 'boys')
      if (isComplete) {
        const standings = await getGroupStandings(group, 'boys')
        if (standings.length > 0) {
          const winner = standings[0]
          boysQualified.set(group, winner)
          console.log(`✅ Group ${group}: ${winner.team_name} (${winner.won}W-${winner.lost}L)`)
        }
      } else {
        console.log(`⏳ Group ${group}: Not yet complete`)
      }
    }
    
    // Process girls division
    console.log('\n📕 GIRLS DIVISION')
    console.log('================')
    
    const girlsGroups = ['PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH']
    const girlsQualified = new Map()
    
    for (const group of girlsGroups) {
      const isComplete = await checkGroupComplete(group, 'girls')
      if (isComplete) {
        const standings = await getGroupStandings(group, 'girls')
        if (standings.length > 0) {
          const winner = standings[0]
          girlsQualified.set(group, winner)
          console.log(`✅ Group ${group}: ${winner.team_name} (${winner.won}W-${winner.lost}L)`)
        }
      } else {
        console.log(`⏳ Group ${group}: Not yet complete`)
      }
    }
    
    // Update knockout matches
    console.log('\n🏆 UPDATING KNOCKOUT MATCHES')
    console.log('============================')
    
    // Get all knockout matches
    const { data: knockoutMatches, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', TOURNAMENT_ID)
      .gte('round', 2)
      .order('match_number')
    
    if (error) throw error
    
    let updatedCount = 0
    
    for (const match of knockoutMatches || []) {
      const metadata = match.metadata || {}
      let team1Updated = false
      let team2Updated = false
      
      // Check team1 placeholder
      if (!match.team1_id && metadata.team1_placeholder) {
        const placeholder = metadata.team1_placeholder
        
        // Extract group from placeholder (e.g., "Winner PA" -> "PA")
        const winnerMatch = placeholder.match(/Winner\s+(\w+)/)
        if (winnerMatch) {
          const group = winnerMatch[1]
          const qualified = metadata.division === 'boys' ? 
            boysQualified.get(group) : girlsQualified.get(group)
          
          if (qualified) {
            await updateKnockoutMatch(match.id, qualified.team_id, null)
            team1Updated = true
            console.log(`✅ Match #${match.match_number}: Set team1 to ${qualified.team_name}`)
          }
        }
      }
      
      // Check team2 placeholder
      if (!match.team2_id && metadata.team2_placeholder) {
        const placeholder = metadata.team2_placeholder
        
        // Extract group from placeholder
        const winnerMatch = placeholder.match(/Winner\s+(\w+)/)
        if (winnerMatch) {
          const group = winnerMatch[1]
          const qualified = metadata.division === 'boys' ? 
            boysQualified.get(group) : girlsQualified.get(group)
          
          if (qualified) {
            await updateKnockoutMatch(match.id, null, qualified.team_id)
            team2Updated = true
            console.log(`✅ Match #${match.match_number}: Set team2 to ${qualified.team_name}`)
          }
        }
      }
      
      if (team1Updated || team2Updated) {
        updatedCount++
      }
    }
    
    console.log(`\n📊 Summary: Updated ${updatedCount} knockout matches`)
    
    // Show current knockout status
    console.log('\n🎯 CURRENT KNOCKOUT STATUS')
    console.log('==========================')
    
    const { data: updatedMatches } = await supabase
      .from('tournament_matches')
      .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
      .eq('tournament_id', TOURNAMENT_ID)
      .gte('round', 2)
      .order('match_number')
    
    for (const match of updatedMatches || []) {
      const team1 = match.team1?.team_name || match.metadata?.team1_placeholder || 'TBD'
      const team2 = match.team2?.team_name || match.metadata?.team2_placeholder || 'TBD'
      const status = match.team1_id && match.team2_id ? '✅' : '⏳'
      
      console.log(`${status} Match #${match.match_number}: ${team1} vs ${team2}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// Run the script
fixKnockoutTeams().then(() => {
  console.log('\n✨ Done!')
  process.exit(0)
})