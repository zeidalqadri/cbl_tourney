#!/usr/bin/env node

// Fix boys tournament progression from second round to semi-finals
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tnglzpywvtafomngxsgc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs';
const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixBoysProgression() {
  console.log('🏆 Fixing Boys Tournament Progression\n');
  console.log('='.repeat(50));
  
  // Get all completed second round matches
  const { data: secondRoundMatches, error } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
      team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('metadata->>type', 'second_round')
    .eq('status', 'completed')
    .order('match_number');
    
  if (error) {
    console.error('Error fetching matches:', error);
    return;
  }
  
  console.log(`\nFound ${secondRoundMatches?.length || 0} completed second round matches\n`);
  
  // Process each completed match
  for (const match of secondRoundMatches || []) {
    // Determine winner
    let winnerId = null;
    let winnerName = null;
    
    if (match.score1 > match.score2) {
      winnerId = match.team1_id;
      winnerName = match.team1?.team_name;
    } else if (match.score2 > match.score1) {
      winnerId = match.team2_id;
      winnerName = match.team2?.team_name;
    } else {
      console.log(`Match #${match.match_number}: Tie - no winner`);
      continue;
    }
    
    console.log(`Match #${match.match_number}: ${winnerName} won (${match.score1}-${match.score2})`);
    
    // Update winner_id if not set
    if (!match.winner_id || match.winner_id !== winnerId) {
      await supabase
        .from('tournament_matches')
        .update({ winner_id: winnerId })
        .eq('id', match.id);
      console.log(`   ✅ Set winner_id`);
    }
    
    // Get the target match using advances_to_match_id
    if (match.advances_to_match_id) {
      const { data: targetMatch } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('id', match.advances_to_match_id)
        .single();
        
      if (targetMatch) {
        // Determine position based on metadata
        const position = match.metadata?.advances_to_position || 'team1';
        
        const updateData = {};
        if (position === 'team1' && targetMatch.team1_id !== winnerId) {
          updateData.team1_id = winnerId;
        } else if (position === 'team2' && targetMatch.team2_id !== winnerId) {
          updateData.team2_id = winnerId;
        }
        
        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('tournament_matches')
            .update(updateData)
            .eq('id', match.advances_to_match_id);
            
          if (!updateError) {
            console.log(`   ✅ Advanced to Match #${targetMatch.match_number} as ${position}`);
          } else {
            console.log(`   ❌ Failed to advance: ${updateError.message}`);
          }
        } else {
          console.log(`   ⏭️  Already advanced to Match #${targetMatch.match_number}`);
        }
      }
    }
  }
  
  // Show semi-final status
  console.log('\n📊 Semi-Finals Status:');
  const { data: semiFinals } = await supabase
    .from('tournament_matches')
    .select(`
      match_number,
      team1_id,
      team2_id,
      team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
      team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
    `)
    .eq('tournament_id', TOURNAMENT_ID)
    .in('match_number', [124, 125, 126, 127])
    .order('match_number');
    
  for (const match of semiFinals || []) {
    const team1 = match.team1?.team_name || 'TBD';
    const team2 = match.team2?.team_name || 'TBD';
    console.log(`   Match #${match.match_number}: ${team1} vs ${team2}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Progression fix completed!');
}

fixBoysProgression()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });