#!/usr/bin/env node

/**
 * Comprehensive tournament integrity verification
 * Checks both boys and girls divisions for correct progression
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

async function verifyTournamentIntegrity() {
  console.log('🏆 TOURNAMENT INTEGRITY VERIFICATION\n');
  console.log('=' .repeat(70));
  
  const report = {
    boys: { issues: [], warnings: [] },
    girls: { issues: [], warnings: [] }
  };
  
  // 1. Check Boys Division
  console.log('\n👦 BOYS DIVISION ANALYSIS');
  console.log('-'.repeat(70));
  
  // Get boys second round standings
  const { data: boysTeams } = await supabase
    .from('tournament_teams')
    .select('id, team_name')
    .eq('division', 'boys');
  
  const boysStandings = {};
  boysTeams?.forEach(team => {
    boysStandings[team.id] = {
      id: team.id,
      name: team.team_name,
      wins: 0,
      losses: 0,
      matchesPlayed: 0
    };
  });
  
  const { data: boysSecondRound } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 2)
    .eq('metadata->>division', 'boys')
    .eq('status', 'completed');
  
  boysSecondRound?.forEach(match => {
    if (match.winner_id) {
      const loser = match.winner_id === match.team1_id ? match.team2_id : match.team1_id;
      if (boysStandings[match.winner_id]) {
        boysStandings[match.winner_id].wins++;
        boysStandings[match.winner_id].matchesPlayed++;
      }
      if (boysStandings[loser]) {
        boysStandings[loser].losses++;
        boysStandings[loser].matchesPlayed++;
      }
    }
  });
  
  const sortedBoys = Object.values(boysStandings)
    .filter(t => t.matchesPlayed > 0)
    .sort((a, b) => b.wins - a.wins);
  
  console.log('\nSecond Round Top 4:');
  sortedBoys.slice(0, 4).forEach((team, i) => {
    console.log(`  ${i + 1}. ${team.name}: ${team.wins}W-${team.losses}L`);
  });
  
  // Check semi-finals match actual teams
  const { data: boysSemis } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .in('match_number', [125, 127]);
  
  console.log('\nSemi-Finals:');
  boysSemis?.forEach(match => {
    const teams = [match.team1?.team_name, match.team2?.team_name].filter(Boolean);
    console.log(`  Match #${match.match_number}: ${teams.join(' vs ') || 'EMPTY'}`);
    
    // Check if teams are in top 4
    teams.forEach(teamName => {
      const isInTop4 = sortedBoys.slice(0, 4).some(t => t.name === teamName);
      if (!isInTop4 && teamName) {
        report.boys.issues.push(`${teamName} in semi-finals but not in top 4 standings`);
      }
    });
  });
  
  // 2. Check Girls Division
  console.log('\n👧 GIRLS DIVISION ANALYSIS');
  console.log('-'.repeat(70));
  
  // Get girls quarter-finals
  const { data: girlsQuarters } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 2)
    .eq('metadata->>division', 'girls')
    .eq('metadata->>type', 'quarter_final')
    .order('match_number');
  
  console.log('\nQuarter-Finals:');
  let qfWinners = [];
  girlsQuarters?.forEach(match => {
    const teams = [match.team1?.team_name, match.team2?.team_name].filter(Boolean);
    const winner = match.winner_id === match.team1_id ? match.team1?.team_name :
                   match.winner_id === match.team2_id ? match.team2?.team_name : null;
    console.log(`  Match #${match.match_number}: ${teams.join(' vs ') || 'EMPTY'}`);
    if (winner) {
      console.log(`    Winner: ${winner}`);
      qfWinners.push(winner);
    }
  });
  
  // Check girls semi-finals
  const { data: girlsSemis } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .in('match_number', [124, 126]);
  
  console.log('\nSemi-Finals:');
  girlsSemis?.forEach(match => {
    const teams = [match.team1?.team_name, match.team2?.team_name].filter(Boolean);
    console.log(`  Match #${match.match_number}: ${teams.join(' vs ') || 'EMPTY'}`);
    
    // Check if teams won their quarter-finals
    teams.forEach(teamName => {
      if (teamName && !qfWinners.includes(teamName)) {
        report.girls.issues.push(`${teamName} in semi-finals but didn't win quarter-final`);
      }
    });
  });
  
  // 3. Check for duplicate teams across rounds
  console.log('\n🔍 CHECKING FOR DUPLICATE TEAMS');
  console.log('-'.repeat(70));
  
  const { data: allKnockout } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('round', 2)
    .order('round');
  
  const teamRoundMap = new Map();
  allKnockout?.forEach(match => {
    const round = match.round;
    [match.team1_id, match.team2_id].forEach(teamId => {
      if (teamId) {
        const key = `${teamId}-${round}`;
        if (!teamRoundMap.has(key)) {
          teamRoundMap.set(key, []);
        }
        teamRoundMap.get(key).push(match.match_number);
      }
    });
  });
  
  teamRoundMap.forEach((matches, key) => {
    if (matches.length > 1) {
      const [teamId, round] = key.split('-');
      const team = allKnockout?.find(m => 
        m.team1_id === teamId || m.team2_id === teamId
      );
      const teamName = team?.team1_id === teamId ? team.team1?.team_name : team?.team2?.team_name;
      console.log(`  ⚠️  ${teamName} appears in multiple matches in round ${round}: #${matches.join(', #')}`);
    }
  });
  
  // 4. Summary Report
  console.log('\n' + '=' .repeat(70));
  console.log('📊 INTEGRITY REPORT SUMMARY\n');
  
  const totalIssues = report.boys.issues.length + report.girls.issues.length;
  const totalWarnings = report.boys.warnings.length + report.girls.warnings.length;
  
  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('✅ TOURNAMENT INTEGRITY VERIFIED');
    console.log('All progressions follow correct logic:');
    console.log('  - Boys: Top 4 from second round standings → Semi-finals');
    console.log('  - Girls: Quarter-final winners → Semi-finals');
  } else {
    if (totalIssues > 0) {
      console.log(`❌ FOUND ${totalIssues} CRITICAL ISSUE(S):\n`);
      if (report.boys.issues.length > 0) {
        console.log('Boys Division:');
        report.boys.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      if (report.girls.issues.length > 0) {
        console.log('Girls Division:');
        report.girls.issues.forEach(issue => console.log(`  - ${issue}`));
      }
    }
    
    if (totalWarnings > 0) {
      console.log(`\n⚠️  FOUND ${totalWarnings} WARNING(S):\n`);
      if (report.boys.warnings.length > 0) {
        console.log('Boys Division:');
        report.boys.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
      if (report.girls.warnings.length > 0) {
        console.log('Girls Division:');
        report.girls.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    }
  }
  
  console.log('\n' + '=' .repeat(70));
}

verifyTournamentIntegrity().catch(console.error);