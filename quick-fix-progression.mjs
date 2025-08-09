#!/usr/bin/env node

// Quick fix script to manually populate winners from completed matches
// This works around the missing trigger issue

import { createClient } from '@supabase/supabase-js';

// Read environment variables directly
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnglzpywvtafomngxsgc.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs';
const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Manual progression rules (hardcoded for quick fix)
const progressionRules = [
  // Boys Semi-Finals to Finals
  { source: 124, target: 128, sourcePos: 'winner', targetPos: 'team1', desc: 'Boys SF1 winner to Final' },
  { source: 125, target: 128, sourcePos: 'winner', targetPos: 'team2', desc: 'Boys SF2 winner to Final' },
  { source: 126, target: 129, sourcePos: 'winner', targetPos: 'team1', desc: 'Boys SF3 winner to Final' },
  { source: 127, target: 129, sourcePos: 'winner', targetPos: 'team2', desc: 'Boys SF4 winner to Final' },
];

async function quickFixProgression() {
  console.log('🔧 Quick Fix: Processing completed matches for progression...\n');
  
  // Get all completed matches
  const { data: completedMatches, error: matchError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'completed')
    .not('score1', 'is', null)
    .not('score2', 'is', null);
    
  if (matchError) {
    console.error('Error fetching matches:', matchError);
    return;
  }
  
  console.log(`Found ${completedMatches?.length || 0} completed matches with scores\n`);
  
  let updateCount = 0;
  
  for (const match of completedMatches || []) {
    // Determine winner
    let winnerId = null;
    if (match.score1 > match.score2) {
      winnerId = match.team1_id;
    } else if (match.score2 > match.score1) {
      winnerId = match.team2_id;
    }
    
    if (!winnerId) {
      console.log(`Match #${match.match_number}: Tie or no teams - skipping`);
      continue;
    }
    
    // Update winner_id if not set
    if (!match.winner_id || match.winner_id !== winnerId) {
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({ winner_id: winnerId })
        .eq('id', match.id);
        
      if (!updateError) {
        console.log(`✅ Set winner for Match #${match.match_number}`);
      }
    }
    
    // Check progression rules
    const rules = progressionRules.filter(r => r.source === match.match_number);
    
    for (const rule of rules) {
      let advancingTeam = null;
      
      if (rule.sourcePos === 'winner') {
        advancingTeam = winnerId;
      } else if (rule.sourcePos === 'loser') {
        advancingTeam = match.score1 > match.score2 ? match.team2_id : match.team1_id;
      }
      
      if (!advancingTeam) continue;
      
      // Update target match
      const updateData = {};
      if (rule.targetPos === 'team1') {
        updateData.team1_id = advancingTeam;
      } else {
        updateData.team2_id = advancingTeam;
      }
      
      const { error: progressError } = await supabase
        .from('tournament_matches')
        .update(updateData)
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', rule.target);
        
      if (!progressError) {
        console.log(`✅ ${rule.desc}: Advanced team to Match #${rule.target}`);
        updateCount++;
      } else {
        console.log(`❌ Failed to advance to Match #${rule.target}:`, progressError.message);
      }
    }
  }
  
  // Show upcoming matches status
  console.log('\n📊 Upcoming Matches Status:');
  const { data: upcomingMatches } = await supabase
    .from('tournament_matches')
    .select(`
      match_number,
      team1_id,
      team2_id,
      team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
      team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [128, 129])
    .order('match_number');
    
  for (const match of upcomingMatches || []) {
    console.log(`Match #${match.match_number}:`);
    console.log(`  Team 1: ${match.team1?.team_name || 'TBD (awaiting winner)'}`);
    console.log(`  Team 2: ${match.team2?.team_name || 'TBD (awaiting winner)'}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Progression updates applied: ${updateCount}`);
  console.log('='.repeat(50));
}

// Run the fix
quickFixProgression()
  .then(() => {
    console.log('\n✅ Quick fix completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });