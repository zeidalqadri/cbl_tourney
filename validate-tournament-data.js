// Script to validate tournament data after sync
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Expected group winners based on PDF
const EXPECTED_BOYS_WINNERS = {
  'LA': 'MALIM',
  'LB': 'WEN HUA', 
  'LC': 'CHENG',
  'LD': 'CHABAU',
  'LE': 'PAY CHEE',
  'LF': 'ALOR GAJAH',
  'LG': 'PAY FONG 1',
  'LH': 'YU HWA',
  'LI': 'MERLIMAU',
  'LJ': 'BACHANG',
  'LK': 'PAY CHIAO',
  'LL': 'YU HSIEN',
  'LM': 'BKT BERUANG',
  'LN': 'PAY FONG 2'
}

const EXPECTED_GIRLS_WINNERS = {
  'PA': 'KEH SENG',
  'PB': 'CHUNG HWA',
  'PC': 'BKT BERUANG',
  'PD': 'CHABAU',
  'PE': 'KIOW MIN',
  'PF': 'PAY CHEE',
  'PG': 'MALIM',
  'PH': 'CHIAO CHEE'
}

async function validateTournamentData() {
  console.log('🔍 Validating Tournament Data Sync...\n')
  
  let errors = []
  let warnings = []

  // 1. Check total teams
  console.log('📊 Checking Teams...')
  const { data: teams, error: teamsError } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
  
  if (teamsError) {
    errors.push(`Failed to fetch teams: ${teamsError.message}`)
  } else {
    const boysTeams = teams.filter(t => t.division === 'boys')
    const girlsTeams = teams.filter(t => t.division === 'girls')
    
    console.log(`   Boys teams: ${boysTeams.length} (expected: 52)`)
    console.log(`   Girls teams: ${girlsTeams.length} (expected: 32)`)
    
    if (boysTeams.length !== 52) errors.push(`Boys teams count mismatch: ${boysTeams.length} != 52`)
    if (girlsTeams.length !== 32) errors.push(`Girls teams count mismatch: ${girlsTeams.length} != 32`)
  }

  // 2. Check total matches
  console.log('\n📊 Checking Matches...')
  const { data: matches, error: matchesError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
  
  if (matchesError) {
    errors.push(`Failed to fetch matches: ${matchesError.message}`)
  } else {
    const completedMatches = matches.filter(m => m.status === 'completed')
    const groupMatches = matches.filter(m => m.round === 1)
    const knockoutMatches = matches.filter(m => m.round > 1)
    
    console.log(`   Total matches: ${matches.length}`)
    console.log(`   Completed matches: ${completedMatches.length}`)
    console.log(`   Group stage matches: ${groupMatches.length}`)
    console.log(`   Knockout matches: ${knockoutMatches.length}`)
    
    // Check for matches with null scores
    const incompleteScores = completedMatches.filter(m => m.score1 === null || m.score2 === null)
    if (incompleteScores.length > 0) {
      errors.push(`${incompleteScores.length} completed matches have null scores`)
    }
  }

  // 3. Validate group winners
  console.log('\n📊 Validating Group Winners...')
  
  // Check boys division winners
  console.log('   Boys Division:')
  for (const [group, expectedWinner] of Object.entries(EXPECTED_BOYS_WINNERS)) {
    const { data: groupWinner } = await supabase
      .from('tournament_teams')
      .select('team_name, group_position, qualification_status')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('pool', group)
      .eq('division', 'boys')
      .eq('group_position', 1)
      .single()
    
    if (groupWinner) {
      if (groupWinner.team_name !== expectedWinner) {
        errors.push(`Group ${group} winner mismatch: ${groupWinner.team_name} != ${expectedWinner}`)
        console.log(`   ❌ Group ${group}: ${groupWinner.team_name} (expected: ${expectedWinner})`)
      } else {
        console.log(`   ✅ Group ${group}: ${groupWinner.team_name}`)
      }
      
      if (groupWinner.qualification_status !== 'qualified') {
        warnings.push(`Group ${group} winner ${groupWinner.team_name} not marked as qualified`)
      }
    } else {
      errors.push(`No winner found for group ${group}`)
    }
  }
  
  // Check girls division winners
  console.log('   Girls Division:')
  for (const [group, expectedWinner] of Object.entries(EXPECTED_GIRLS_WINNERS)) {
    const { data: groupWinner } = await supabase
      .from('tournament_teams')
      .select('team_name, group_position, qualification_status')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('pool', group)
      .eq('division', 'girls')
      .eq('group_position', 1)
      .single()
    
    if (groupWinner) {
      if (groupWinner.team_name !== expectedWinner) {
        errors.push(`Group ${group} winner mismatch: ${groupWinner.team_name} != ${expectedWinner}`)
        console.log(`   ❌ Group ${group}: ${groupWinner.team_name} (expected: ${expectedWinner})`)
      } else {
        console.log(`   ✅ Group ${group}: ${groupWinner.team_name}`)
      }
      
      if (groupWinner.qualification_status !== 'qualified') {
        warnings.push(`Group ${group} winner ${groupWinner.team_name} not marked as qualified`)
      }
    } else {
      errors.push(`No winner found for group ${group}`)
    }
  }

  // 4. Check team statistics
  console.log('\n📊 Checking Team Statistics...')
  const { data: teamStats } = await supabase
    .from('tournament_teams')
    .select('team_name, pool, division, group_wins, group_losses, group_played, points_for, points_against')
    .eq('tournament_id', TOURNAMENT_ID)
    .not('group_played', 'eq', 0)
    .limit(10)
  
  if (teamStats) {
    console.log('   Sample team statistics:')
    teamStats.forEach(team => {
      const winRate = team.group_played > 0 ? (team.group_wins / team.group_played * 100).toFixed(1) : 0
      console.log(`   ${team.team_name} (${team.pool}): ${team.group_wins}W-${team.group_losses}L, ${team.points_for}-${team.points_against} pts`)
    })
  }

  // 5. Check knockout bracket setup
  console.log('\n📊 Checking Knockout Brackets...')
  const { data: knockoutMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .gt('round', 1)
    .order('match_number')
  
  if (knockoutMatches) {
    const secondRound = knockoutMatches.filter(m => m.round === 2)
    const semiFinals = knockoutMatches.filter(m => m.round === 3)
    const finals = knockoutMatches.filter(m => m.round === 4)
    
    console.log(`   Second Round/Quarter-Finals: ${secondRound.length} matches`)
    console.log(`   Semi-Finals: ${semiFinals.length} matches`)
    console.log(`   Finals: ${finals.length} matches`)
    
    // Check for proper bracket structure
    if (finals.length !== 2) warnings.push(`Expected 2 final matches, found ${finals.length}`)
    if (semiFinals.length !== 4) warnings.push(`Expected 4 semi-final matches, found ${semiFinals.length}`)
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('VALIDATION SUMMARY')
  console.log('='.repeat(60))
  
  if (errors.length === 0) {
    console.log('✅ All validations passed!')
  } else {
    console.log(`❌ Found ${errors.length} errors:`)
    errors.forEach(err => console.log(`   - ${err}`))
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Found ${warnings.length} warnings:`)
    warnings.forEach(warn => console.log(`   - ${warn}`))
  }
  
  console.log('\n' + '='.repeat(60))
  
  return { errors, warnings }
}

// Run validation
validateTournamentData()
  .then(({ errors, warnings }) => {
    if (errors.length === 0) {
      console.log('\n🎉 Tournament data sync validation completed successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Validation failed with errors. Please check the data sync.')
      process.exit(1)
    }
  })
  .catch(err => {
    console.error('Validation script error:', err)
    process.exit(1)
  })