#!/usr/bin/env node

// Script to correct knockout matches according to official PDF schedule
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Official schedule from PDF for August 6, 2025
const officialSchedule = {
  // Girls Quarter-Finals (PQF)
  102: { type: 'PQF1', team1: 'KEH SENG (G)', team2: 'CHUNG HWA (G)', group: 'PA', group2: 'PB' },
  109: { type: 'PQF2', team1: 'BKT BERUANG (G)', team2: 'CHABAU (G)', group: 'PC', group2: 'PD' },
  116: { type: 'PQF3', team1: 'KIOW MIN (G)', team2: 'PAY CHEE (G)', group: 'PE', group2: 'PF' },
  123: { type: 'PQF4', team1: 'MALIM (G)', team2: 'CHIAO CHEE (G)', group: 'PG', group2: 'PH' },
  
  // Boys Second Round Groups
  // Group LXA matches
  103: { type: 'LXA', team1: 'WEN HUA (B)', team2: 'CHENG (B)', group: 'LB', group2: 'LC' },
  110: { type: 'LXA', team1: 'CHENG (B)', team2: 'MALIM (B)', group: 'LC', group2: 'LA' },
  117: { type: 'LXA', team1: 'MALIM (B)', team2: 'WEN HUA (B)', group: 'LA', group2: 'LB' },
  
  // Group LXB matches
  104: { type: 'LXB', team1: 'CHABAU (B)', team2: 'PAY CHEE (B)', group: 'LD', group2: 'LE' },
  105: { type: 'LXB', team1: 'ALOR GAJAH (B)', team2: 'PAY FONG 1 (B)', group: 'LF', group2: 'LG' },
  111: { type: 'LXB', team1: 'CHABAU (B)', team2: 'ALOR GAJAH (B)', group: 'LD', group2: 'LF' },
  112: { type: 'LXB', team1: 'PAY CHEE (B)', team2: 'PAY FONG 1 (B)', group: 'LE', group2: 'LG' },
  118: { type: 'LXB', team1: 'PAY FONG 1 (B)', team2: 'CHABAU (B)', group: 'LG', group2: 'LD' },
  119: { type: 'LXB', team1: 'ALOR GAJAH (B)', team2: 'PAY CHEE (B)', group: 'LF', group2: 'LE' },
  
  // Group LYA matches
  106: { type: 'LYA', team1: 'YU HWA (B)', team2: 'MERLIMAU (B)', group: 'LH', group2: 'LI' },
  107: { type: 'LYA', team1: 'BACHANG (B)', team2: 'PAY CHIAO (B)', group: 'LJ', group2: 'LK' },
  113: { type: 'LYA', team1: 'YU HWA (B)', team2: 'BACHANG (B)', group: 'LH', group2: 'LJ' },
  114: { type: 'LYA', team1: 'MERLIMAU (B)', team2: 'PAY CHIAO (B)', group: 'LI', group2: 'LK' },
  120: { type: 'LYA', team1: 'PAY CHIAO (B)', team2: 'YU HWA (B)', group: 'LK', group2: 'LH' },
  121: { type: 'LYA', team1: 'BACHANG (B)', team2: 'MERLIMAU (B)', group: 'LJ', group2: 'LI' },
  
  // Group LYB matches
  108: { type: 'LYB', team1: 'BKT BERUANG (B)', team2: 'PAY FONG 2 (B)', group: 'LM', group2: 'LN' },
  115: { type: 'LYB', team1: 'PAY FONG 2 (B)', team2: 'YU HSIEN (B)', group: 'LN', group2: 'LL' },
  122: { type: 'LYB', team1: 'YU HSIEN (B)', team2: 'BKT BERUANG (B)', group: 'LL', group2: 'LM' }
}

async function correctKnockoutSchedule() {
  console.log('📋 Correcting Knockout Schedule According to Official PDF...\n')
  
  // First, get all qualified teams
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('division', ['boys', 'girls'])
  
  // Create team mapping by name
  const teamMap = {}
  teams?.forEach(team => {
    teamMap[team.team_name] = team.id
  })
  
  console.log(`Found ${Object.keys(teamMap).length} teams in database\n`)
  
  let successCount = 0
  let errorCount = 0
  let createdCount = 0
  
  // Process each match from the official schedule
  for (const [matchNumber, matchData] of Object.entries(officialSchedule)) {
    const team1Id = teamMap[matchData.team1]
    const team2Id = teamMap[matchData.team2]
    
    if (!team1Id || !team2Id) {
      console.log(`⚠️  Teams not found for match #${matchNumber}:`)
      console.log(`   ${matchData.team1}: ${team1Id ? 'Found' : 'NOT FOUND'}`)
      console.log(`   ${matchData.team2}: ${team2Id ? 'Found' : 'NOT FOUND'}`)
      errorCount++
      continue
    }
    
    // Check if match exists
    const { data: existingMatch } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('match_number', parseInt(matchNumber))
      .single()
    
    const matchMetadata = {
      type: matchData.type,
      division: matchData.type.startsWith('P') ? 'girls' : 'boys',
      round_name: matchData.type.startsWith('P') ? 'Quarter-Finals' : `Second Round Group ${matchData.type}`,
      source_groups: [matchData.group, matchData.group2]
    }
    
    if (existingMatch) {
      // Update existing match
      const { error } = await supabase
        .from('tournament_matches')
        .update({
          team1_id: team1Id,
          team2_id: team2Id,
          status: 'pending',
          round: matchData.type.startsWith('P') ? 3 : 2,
          metadata: matchMetadata
        })
        .eq('id', existingMatch.id)
      
      if (error) {
        console.log(`❌ Error updating match #${matchNumber}: ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ Updated match #${matchNumber}: ${matchData.team1} vs ${matchData.team2}`)
        successCount++
      }
    } else {
      // Create new match
      const { error } = await supabase
        .from('tournament_matches')
        .insert({
          tournament_id: TOURNAMENT_ID,
          match_number: parseInt(matchNumber),
          team1_id: team1Id,
          team2_id: team2Id,
          status: 'pending',
          round: matchData.type.startsWith('P') ? 3 : 2,
          scheduled_time: `2025-08-06T08:00:00`,
          venue: 'SJKC YU HWA',
          court: 'Gelanggang A',
          metadata: matchMetadata
        })
      
      if (error) {
        console.log(`❌ Error creating match #${matchNumber}: ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ Created match #${matchNumber}: ${matchData.team1} vs ${matchData.team2}`)
        createdCount++
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('CORRECTION SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated: ${successCount} matches`)
  console.log(`✅ Successfully created: ${createdCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  console.log('\nTotal matches in official schedule: ' + Object.keys(officialSchedule).length)
  
  // Now verify the corrections
  console.log('\n📊 Verifying Corrections...\n')
  
  const { data: verifyMatches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(team_name), team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)')
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', Object.keys(officialSchedule).map(n => parseInt(n)))
    .order('match_number', { ascending: true })
  
  console.log('Current Knockout Matches:')
  console.log('='.repeat(60))
  verifyMatches?.forEach(match => {
    const expected = officialSchedule[match.match_number]
    const isCorrect = match.team1?.team_name === expected?.team1 && 
                     match.team2?.team_name === expected?.team2
    const status = isCorrect ? '✅' : '❌'
    console.log(`${status} Match #${match.match_number} [${match.metadata?.type || '?'}]: ${match.team1?.team_name} vs ${match.team2?.team_name}`)
  })
}

// Run the correction
correctKnockoutSchedule()
  .then(() => {
    console.log('\n🎉 Knockout schedule corrected successfully!')
    console.log('All matches now align with the official PDF schedule.')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })