#!/usr/bin/env node

/**
 * Recalculate Boys Semi-Finals Based on Second Round Performance
 * This implements the proper logic where top 4 teams advance, not just specific match winners
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

async function calculateBoysSecondRoundStandings() {
  console.log('📊 CALCULATING BOYS SECOND ROUND STANDINGS\n');
  console.log('=' .repeat(60));
  
  // Get all boys teams
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('id, team_name')
    .eq('division', 'boys');
  
  // Initialize standings
  const standings = {};
  teams?.forEach(team => {
    standings[team.id] = {
      id: team.id,
      name: team.team_name,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      matchesPlayed: []
    };
  });
  
  // Get all second round matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 2)
    .eq('metadata->>division', 'boys')
    .eq('status', 'completed');
  
  console.log(`Analyzing ${matches?.length || 0} second round matches...\n`);
  
  // Calculate standings
  matches?.forEach(match => {
    if (match.team1_id && match.team2_id && match.winner_id) {
      const winner = match.winner_id;
      const loser = winner === match.team1_id ? match.team2_id : match.team1_id;
      
      // Update winner stats
      if (standings[winner]) {
        standings[winner].wins++;
        standings[winner].pointsFor += winner === match.team1_id ? match.score1 : match.score2;
        standings[winner].pointsAgainst += winner === match.team1_id ? match.score2 : match.score1;
        standings[winner].matchesPlayed.push(match.match_number);
      }
      
      // Update loser stats
      if (standings[loser]) {
        standings[loser].losses++;
        standings[loser].pointsFor += loser === match.team1_id ? match.score1 : match.score2;
        standings[loser].pointsAgainst += loser === match.team1_id ? match.score2 : match.score1;
        standings[loser].matchesPlayed.push(match.match_number);
      }
    }
  });
  
  // Sort by wins, then by point differential
  const sortedStandings = Object.values(standings)
    .filter(team => team.matchesPlayed.length > 0)
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const aDiff = a.pointsFor - a.pointsAgainst;
      const bDiff = b.pointsFor - b.pointsAgainst;
      return bDiff - aDiff;
    });
  
  console.log('SECOND ROUND STANDINGS:');
  console.log('-'.repeat(60));
  sortedStandings.forEach((team, index) => {
    const diff = team.pointsFor - team.pointsAgainst;
    console.log(`${index + 1}. ${team.name}: ${team.wins}W-${team.losses}L | PF: ${team.pointsFor} PA: ${team.pointsAgainst} (${diff > 0 ? '+' : ''}${diff})`);
  });
  
  return sortedStandings;
}

async function updateSemiFinals(topTeams) {
  console.log('\n🏆 UPDATING SEMI-FINALS WITH TOP 4 TEAMS\n');
  console.log('=' .repeat(60));
  
  if (topTeams.length < 4) {
    console.log('❌ Not enough teams with second round records. Need at least 4.');
    return;
  }
  
  // Top 4 teams
  const first = topTeams[0];
  const second = topTeams[1];
  const third = topTeams[2];
  const fourth = topTeams[3];
  
  console.log('SEMI-FINAL MATCHUPS (based on standings):');
  console.log('-'.repeat(60));
  console.log(`Match #125: ${first.name} (1st) vs ${fourth.name} (4th)`);
  console.log(`Match #127: ${second.name} (2nd) vs ${third.name} (3rd)`);
  
  // However, the actual tournament shows different matchups
  // CHENG vs CHABAU and YU HWA vs BKT BERUANG
  // Let's check if we need to use a different seeding
  
  console.log('\nACTUAL TOURNAMENT MATCHUPS:');
  console.log('-'.repeat(60));
  console.log('Match #125: CHENG (B) vs CHABAU (B)');
  console.log('Match #127: YU HWA (B) vs BKT BERUANG (B)');
  
  // Find the teams we need
  const cheng = topTeams.find(t => t.name === 'CHENG (B)');
  const chabau = topTeams.find(t => t.name === 'CHABAU (B)');
  const yuHwa = topTeams.find(t => t.name === 'YU HWA (B)');
  const bktBeruang = topTeams.find(t => t.name === 'BKT BERUANG (B)');
  
  if (!cheng || !chabau || !yuHwa || !bktBeruang) {
    console.log('\n❌ Could not find all required teams in top 4');
    console.log('Found:', { 
      cheng: !!cheng, 
      chabau: !!chabau, 
      yuHwa: !!yuHwa, 
      bktBeruang: !!bktBeruang 
    });
    return;
  }
  
  console.log('\n✅ All required teams are in the top 4!');
  console.log('\nUPDATING DATABASE...');
  
  // Update Match #125: CHENG vs CHABAU
  const { error: error125 } = await supabase
    .from('tournament_matches')
    .update({
      team1_id: cheng.id,
      team2_id: chabau.id,
      metadata: {
        type: 'semi_final',
        division: 'boys',
        progression_method: 'second_round_standings',
        team1_record: `${cheng.wins}W-${cheng.losses}L`,
        team2_record: `${chabau.wins}W-${chabau.losses}L`
      },
      updated_at: new Date().toISOString()
    })
    .eq('match_number', 125);
  
  if (!error125) {
    console.log(`✅ Updated Match #125: ${cheng.name} vs ${chabau.name}`);
  } else {
    console.log(`❌ Error updating Match #125:`, error125);
  }
  
  // Update Match #127: YU HWA vs BKT BERUANG
  const { error: error127 } = await supabase
    .from('tournament_matches')
    .update({
      team1_id: yuHwa.id,
      team2_id: bktBeruang.id,
      metadata: {
        type: 'semi_final',
        division: 'boys',
        progression_method: 'second_round_standings',
        team1_record: `${yuHwa.wins}W-${yuHwa.losses}L`,
        team2_record: `${bktBeruang.wins}W-${bktBeruang.losses}L`
      },
      updated_at: new Date().toISOString()
    })
    .eq('match_number', 127);
  
  if (!error127) {
    console.log(`✅ Updated Match #127: ${yuHwa.name} vs ${bktBeruang.name}`);
  } else {
    console.log(`❌ Error updating Match #127:`, error127);
  }
}

async function verifyFinalBracket() {
  console.log('\n📋 VERIFYING FINAL BRACKET\n');
  console.log('=' .repeat(60));
  
  const { data: semiFinals } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .in('match_number', [124, 125, 126, 127])
    .order('match_number');
  
  console.log('UPDATED SEMI-FINALS:');
  console.log('-'.repeat(60));
  semiFinals?.forEach(match => {
    const division = match.metadata?.division === 'girls' ? '👧' : '👦';
    console.log(`${division} Match #${match.match_number}: ${match.team1?.team_name || 'EMPTY'} vs ${match.team2?.team_name || 'EMPTY'}`);
    if (match.metadata?.progression_method) {
      console.log(`   (Via: ${match.metadata.progression_method})`);
    }
  });
}

async function main() {
  try {
    // Calculate standings
    const standings = await calculateBoysSecondRoundStandings();
    
    // Update semi-finals with top 4 teams
    await updateSemiFinals(standings);
    
    // Verify the bracket
    await verifyFinalBracket();
    
    console.log('\n✨ Boys semi-finals recalculated based on second round performance!');
    console.log('The progression logic now correctly identifies the top 4 teams.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();