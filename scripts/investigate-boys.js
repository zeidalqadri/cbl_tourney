#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function investigateBoysProgression() {
  console.log('🔍 INVESTIGATING BOYS BRACKET DISCREPANCY\n');
  console.log('=' .repeat(60));
  
  // Get all boys second round matches
  const { data: secondRound } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('round', 2)
    .eq('metadata->>division', 'boys')
    .order('match_number');
  
  console.log('\nBOYS SECOND ROUND RESULTS:');
  console.log('-'.repeat(60));
  
  const winners = [];
  secondRound?.forEach(m => {
    const winner = m.winner_id === m.team1_id ? m.team1?.team_name : 
                   m.winner_id === m.team2_id ? m.team2?.team_name : 'none';
    console.log(`Match #${m.match_number}: ${m.team1?.team_name} vs ${m.team2?.team_name}`);
    console.log(`  Score: ${m.score1}-${m.score2}, Winner: ${winner}`);
    
    if (winner !== 'none') {
      winners.push({
        match: m.match_number,
        winner: winner,
        winnerId: m.winner_id
      });
    }
  });
  
  // Get current semi-finals
  const { data: semiFinals } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .in('match_number', [125, 127])
    .order('match_number');
  
  console.log('\n\nCURRENT BOYS SEMI-FINALS IN DATABASE:');
  console.log('-'.repeat(60));
  semiFinals?.forEach(m => {
    console.log(`Match #${m.match_number}: ${m.team1?.team_name || 'EMPTY'} vs ${m.team2?.team_name || 'EMPTY'}`);
  });
  
  console.log('\n\nEXPECTED SEMI-FINALS (from actual tournament):');
  console.log('-'.repeat(60));
  console.log('Match #125: CHENG (B) vs CHABAU (B)');
  console.log('Match #127: YU HWA (B) vs BKT BERUANG (B)');
  
  console.log('\n\nANALYSIS:');
  console.log('-'.repeat(60));
  
  // Find which matches had these teams as winners
  const expectedTeams = ['CHENG (B)', 'CHABAU (B)', 'YU HWA (B)', 'BKT BERUANG (B)'];
  
  console.log('Looking for these teams in second round winners:');
  expectedTeams.forEach(teamName => {
    const match = secondRound?.find(m => 
      (m.winner_id === m.team1_id && m.team1?.team_name === teamName) ||
      (m.winner_id === m.team2_id && m.team2?.team_name === teamName)
    );
    
    if (match) {
      console.log(`  ✅ ${teamName} won Match #${match.match_number}`);
    } else {
      console.log(`  ❌ ${teamName} - NOT FOUND as winner`);
    }
  });
  
  // Get team IDs for correct teams
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('id, team_name')
    .in('team_name', ['CHENG (B)', 'CHABAU (B)', 'YU HWA (B)', 'BKT BERUANG (B)']);
  
  console.log('\n\nTEAM IDs FOR CORRECTION:');
  console.log('-'.repeat(60));
  teams?.forEach(t => {
    console.log(`  ${t.team_name}: ${t.id}`);
  });
  
  // Check what matches progressed incorrectly
  console.log('\n\nWHAT WENT WRONG:');
  console.log('-'.repeat(60));
  
  const malimMatch = secondRound?.find(m => 
    (m.winner_id === m.team1_id && m.team1?.team_name === 'MALIM (B)') ||
    (m.winner_id === m.team2_id && m.team2?.team_name === 'MALIM (B)')
  );
  
  const bachangMatch = secondRound?.find(m => 
    (m.winner_id === m.team1_id && m.team1?.team_name === 'BACHANG (B)') ||
    (m.winner_id === m.team2_id && m.team2?.team_name === 'BACHANG (B)')
  );
  
  const alorGajahMatch = secondRound?.find(m => 
    (m.winner_id === m.team1_id && m.team1?.team_name === 'ALOR GAJAH (B)') ||
    (m.winner_id === m.team2_id && m.team2?.team_name === 'ALOR GAJAH (B)')
  );
  
  console.log('Teams currently in semi-finals but shouldn\'t be:');
  if (malimMatch) {
    console.log(`  MALIM (B) won Match #${malimMatch.match_number} (${malimMatch.score1}-${malimMatch.score2})`);
  }
  if (bachangMatch) {
    console.log(`  BACHANG (B) won Match #${bachangMatch.match_number} (${bachangMatch.score1}-${bachangMatch.score2})`);
  }
  if (alorGajahMatch) {
    console.log(`  ALOR GAJAH (B) won Match #${alorGajahMatch.match_number} (${alorGajahMatch.score1}-${alorGajahMatch.score2})`);
  }
  
  console.log('\n\nRECOMMENDATION:');
  console.log('-'.repeat(60));
  console.log('The semi-finals should be updated to:');
  console.log('  Match #125: CHENG (B) vs CHABAU (B)');
  console.log('  Match #127: YU HWA (B) vs BKT BERUANG (B)');
  console.log('\nThese are the correct teams based on the actual tournament progression.');
}

investigateBoysProgression().catch(console.error);