#!/usr/bin/env node

// Script to fix knockout matches with actual qualified teams
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Based on the PDF tournament structure
const knockoutStructure = {
  girls: {
    // Quarter-finals (Match 102-109)
    102: { team1: 'PA', team2: 'PB' },  // KEH SENG vs CHUNG HWA
    103: { team1: 'PC', team2: 'PD' },  // CHABAU vs KIOW MIN
    104: { team1: 'PE', team2: 'PF' },  // PAY CHEE vs CHENG
    105: { team1: 'PG', team2: 'PH' },  // MALIM vs CHIAO CHEE
  },
  boys: {
    // Second Round Group Stage matches
    // Group LXA: LA, LB, LC, LD
    103: { team1: 'LA', team2: 'LB' },  // MALIM vs WEN HUA
    104: { team1: 'LD', team2: 'LE' },  // CHABAU vs PAY CHEE
    105: { team1: 'LF', team2: 'LG' },  // ALOR GAJAH vs PAY FONG 1
    106: { team1: 'LH', team2: 'LI' },  // YU HWA vs MERLIMAU
    107: { team1: 'LJ', team2: 'LK' },  // BACHANG vs PAY CHIAO
    // Add more second round matches as needed
  }
}

async function fixKnockoutMatches() {
  console.log('🏀 Fixing Knockout Stage Matches...\n')
  
  // Get all qualified teams
  const { data: qualifiedTeams } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .or('qualification_status.eq.qualified,qualification_status.eq.active')
    .in('division', ['boys', 'girls'])
  
  // Create mapping of pool code to team ID
  const teamMapping = {}
  qualifiedTeams?.forEach(team => {
    if (team.pool) {
      teamMapping[team.pool] = team.id
      console.log(`   ${team.pool}: ${team.team_name} → ${team.id}`)
    }
  })
  
  console.log('\n📊 Updating Knockout Matches...\n')
  
  let updateCount = 0
  let errorCount = 0
  
  // Update girls quarter-finals
  for (const [matchNumber, matchData] of Object.entries(knockoutStructure.girls)) {
    const team1Id = teamMapping[matchData.team1]
    const team2Id = teamMapping[matchData.team2]
    
    if (team1Id && team2Id) {
      const { error } = await supabase
        .from('tournament_matches')
        .update({
          team1_id: team1Id,
          team2_id: team2Id,
          status: 'pending',
          metadata: {
            division: 'girls',
            type: 'quarter_final',
            round_name: 'Quarter-Finals'
          }
        })
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', parseInt(matchNumber))
      
      if (error) {
        console.log(`   ❌ Error updating match #${matchNumber}: ${error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ Updated match #${matchNumber}: ${matchData.team1} vs ${matchData.team2}`)
        updateCount++
      }
    }
  }
  
  // Update boys second round matches
  for (const [matchNumber, matchData] of Object.entries(knockoutStructure.boys)) {
    const team1Id = teamMapping[matchData.team1]
    const team2Id = teamMapping[matchData.team2]
    
    if (team1Id && team2Id) {
      const { error } = await supabase
        .from('tournament_matches')
        .update({
          team1_id: team1Id,
          team2_id: team2Id,
          status: 'pending',
          metadata: {
            division: 'boys',
            type: 'second_round',
            round_name: 'Second Round'
          }
        })
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', parseInt(matchNumber))
      
      if (error) {
        console.log(`   ❌ Error updating match #${matchNumber}: ${error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ Updated match #${matchNumber}: ${matchData.team1} vs ${matchData.team2}`)
        updateCount++
      }
    }
  }
  
  // Create missing knockout matches if needed
  console.log('\n📋 Checking for missing knockout matches...')
  
  const { data: existingMatches } = await supabase
    .from('tournament_matches')
    .select('match_number')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 102)
    .lte('match_number', 110)
  
  const existingNumbers = existingMatches?.map(m => m.match_number) || []
  const requiredNumbers = [102, 103, 104, 105, 106, 107, 108, 109, 110]
  const missingNumbers = requiredNumbers.filter(n => !existingNumbers.includes(n))
  
  if (missingNumbers.length > 0) {
    console.log(`   Found ${missingNumbers.length} missing match numbers: ${missingNumbers.join(', ')}`)
    
    for (const matchNumber of missingNumbers) {
      const matchData = knockoutStructure.girls[matchNumber] || knockoutStructure.boys[matchNumber]
      
      if (matchData) {
        const team1Id = teamMapping[matchData.team1]
        const team2Id = teamMapping[matchData.team2]
        
        if (team1Id && team2Id) {
          const division = matchNumber === 102 || (matchNumber >= 102 && matchNumber <= 105) ? 'girls' : 'boys'
          
          const { error } = await supabase
            .from('tournament_matches')
            .insert({
              tournament_id: TOURNAMENT_ID,
              match_number: matchNumber,
              team1_id: team1Id,
              team2_id: team2Id,
              round: division === 'girls' ? 3 : 2, // Quarter-finals or second round
              status: 'pending',
              metadata: {
                division: division,
                type: division === 'girls' ? 'quarter_final' : 'second_round',
                round_name: division === 'girls' ? 'Quarter-Finals' : 'Second Round'
              }
            })
          
          if (error) {
            console.log(`   ❌ Error creating match #${matchNumber}: ${error.message}`)
            errorCount++
          } else {
            console.log(`   ✅ Created match #${matchNumber}: ${matchData.team1} vs ${matchData.team2}`)
            updateCount++
          }
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('UPDATE SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated/created: ${updateCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
}

// Run the fix
fixKnockoutMatches()
  .then(() => {
    console.log('\n🎉 Knockout matches fixed successfully!')
    console.log('The frontend should now show actual team names.')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })