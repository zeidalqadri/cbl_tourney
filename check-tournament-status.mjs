#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tnglzpywvtafomngxsgc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs';
const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTournamentStatus() {
  console.log('🏆 Tournament Status Check\n');
  console.log('='.repeat(50));
  
  // Check boys group stage matches
  const { data: boysGroupMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, status, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 1)
    .lte('match_number', 100)
    .eq('metadata->>division', 'boys')
    .order('match_number');
    
  const boysGroupCompleted = boysGroupMatches?.filter(m => m.status === 'completed').length || 0;
  const boysGroupTotal = boysGroupMatches?.length || 0;
  
  console.log(`\n📊 Boys Division:`);
  console.log(`   Group Stage: ${boysGroupCompleted}/${boysGroupTotal} matches completed`);
  
  // Check boys knockout matches
  const { data: boysKnockout } = await supabase
    .from('tournament_matches')
    .select(`
      match_number,
      status,
      metadata,
      team1_id,
      team2_id,
      score1,
      score2,
      team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
      team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 124)
    .lte('match_number', 129)
    .order('match_number');
    
  console.log('\n   Knockout Stage:');
  for (const match of boysKnockout || []) {
    const type = match.metadata?.type || 'Unknown';
    const team1 = match.team1?.team_name || 'TBD';
    const team2 = match.team2?.team_name || 'TBD';
    const score = match.status === 'completed' ? ` (${match.score1}-${match.score2})` : '';
    console.log(`      Match #${match.match_number} [${type}]: ${team1} vs ${team2} - ${match.status}${score}`);
  }
  
  // Check girls matches
  const { data: girlsGroupMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, status, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('match_number', 1)
    .lte('match_number', 100)
    .eq('metadata->>division', 'girls')
    .order('match_number');
    
  const girlsGroupCompleted = girlsGroupMatches?.filter(m => m.status === 'completed').length || 0;
  const girlsGroupTotal = girlsGroupMatches?.length || 0;
  
  console.log(`\n📊 Girls Division:`);
  console.log(`   Group Stage: ${girlsGroupCompleted}/${girlsGroupTotal} matches completed`);
  
  // Check which groups are complete
  console.log('\n📋 Group Completion Status:');
  
  // Boys groups
  const boysGroups = ['LA', 'LB', 'LC', 'LD', 'LE', 'LF', 'LG', 'LH', 'LI', 'LJ', 'LK', 'LL', 'LM', 'LN'];
  for (const group of boysGroups) {
    const { data: groupMatches } = await supabase
      .from('tournament_matches')
      .select('status')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('metadata->>division', 'boys')
      .eq('metadata->>group', group);
      
    const completed = groupMatches?.filter(m => m.status === 'completed').length || 0;
    const total = groupMatches?.length || 0;
    
    if (total > 0) {
      const isComplete = completed === total;
      console.log(`   ${group}: ${completed}/${total} ${isComplete ? '✅ COMPLETE' : '⏳ In Progress'}`);
    }
  }
  
  // Check for matches that should trigger progression
  console.log('\n🔄 Matches Ready for Progression:');
  
  // Check second round matches (if boys groups are done)
  const { data: secondRoundMatches } = await supabase
    .from('tournament_matches')
    .select(`
      match_number,
      status,
      metadata,
      team1_id,
      team2_id,
      advances_to_match_id
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('metadata->>type', 'second_round')
    .eq('status', 'completed')
    .not('advances_to_match_id', 'is', null);
    
  if (secondRoundMatches && secondRoundMatches.length > 0) {
    console.log('\n   Second Round matches ready to advance winners:');
    for (const match of secondRoundMatches) {
      console.log(`      Match #${match.match_number} -> advances to match ID ${match.advances_to_match_id}`);
    }
  } else {
    console.log('   No second round matches completed yet');
  }
  
  console.log('\n' + '='.repeat(50));
}

checkTournamentStatus()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });