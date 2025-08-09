#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkChengRecord() {
  console.log('🔍 INVESTIGATING CHENG (B) SECOND ROUND RECORD\n');
  console.log('=' .repeat(60));
  
  // Find CHENG team
  const { data: cheng } = await supabase
    .from('tournament_teams')
    .select('id, team_name')
    .eq('team_name', 'CHENG (B)')
    .single();
  
  if (!cheng) {
    console.log('CHENG (B) team not found');
    return;
  }
  
  console.log(`Team: ${cheng.team_name}`);
  console.log(`ID: ${cheng.id}\n`);
  
  // Get CHENG's second round matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    .eq('round', 2)
    .eq('metadata->>division', 'boys')
    .or(`team1_id.eq.${cheng.id},team2_id.eq.${cheng.id}`);
  
  console.log('SECOND ROUND MATCHES:');
  console.log('-'.repeat(60));
  
  let wins = 0, losses = 0;
  let totalFor = 0, totalAgainst = 0;
  
  matches?.forEach(m => {
    const isTeam1 = m.team1_id === cheng.id;
    const isTeam2 = m.team2_id === cheng.id;
    const opponent = isTeam1 ? m.team2?.team_name : m.team1?.team_name;
    const score = isTeam1 ? `${m.score1}-${m.score2}` : `${m.score2}-${m.score1}`;
    const won = m.winner_id === cheng.id;
    
    console.log(`Match #${m.match_number}: vs ${opponent}`);
    console.log(`  Score: ${score} | Status: ${m.status} | Result: ${won ? 'WIN' : 'LOSS'}`);
    
    if (m.status === 'completed') {
      if (won) {
        wins++;
        totalFor += isTeam1 ? m.score1 : m.score2;
        totalAgainst += isTeam1 ? m.score2 : m.score1;
      } else {
        losses++;
        totalFor += isTeam1 ? m.score1 : m.score2;
        totalAgainst += isTeam1 ? m.score2 : m.score1;
      }
    }
  });
  
  const differential = totalFor - totalAgainst;
  
  console.log('\n' + '=' .repeat(60));
  console.log('FINAL STATISTICS:');
  console.log(`Record: ${wins}W-${losses}L`);
  console.log(`Points For: ${totalFor}`);
  console.log(`Points Against: ${totalAgainst}`);
  console.log(`Point Differential: ${differential > 0 ? '+' : ''}${differential}`);
  
  // Compare with other teams' records
  console.log('\n' + '=' .repeat(60));
  console.log('COMPARISON WITH OTHER TOP TEAMS:');
  console.log('-'.repeat(60));
  
  const topTeams = [
    { name: 'YU HWA (B)', wins: 3, losses: 0 },
    { name: 'CHABAU (B)', wins: 3, losses: 0 },
    { name: 'BACHANG (B)', wins: 2, losses: 1 },
    { name: 'BKT BERUANG (B)', wins: 2, losses: 0 },
    { name: 'PAY FONG 1 (B)', wins: 2, losses: 1 },
    { name: 'CHENG (B)', wins: wins, losses: losses }
  ];
  
  topTeams.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
  
  topTeams.forEach((team, i) => {
    const isCurrent = team.name === 'CHENG (B)';
    console.log(`${i + 1}. ${team.name}: ${team.wins}W-${team.losses}L ${isCurrent ? '← CURRENT POSITION' : ''}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('ANALYSIS:');
  
  if (wins >= 2) {
    console.log('✅ CHENG has enough wins to potentially qualify for semi-finals');
    console.log('   The actual tournament used specific matchup selections,');
    console.log('   not just top 4 by wins.');
  } else {
    console.log('⚠️  CHENG may not have enough wins for standard top 4 qualification');
    console.log('   But was selected for semi-finals in the actual tournament.');
  }
}

checkChengRecord().catch(console.error);