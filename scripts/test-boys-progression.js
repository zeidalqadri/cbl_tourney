#!/usr/bin/env node

/**
 * Test the boys progression logic after updating tournament-progression.ts
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

async function testBoysProgression() {
  console.log('🧪 TESTING BOYS PROGRESSION LOGIC\n');
  console.log('=' .repeat(60));
  
  // Check current semi-finals
  const { data: semiFinals } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:tournament_teams!tournament_matches_team1_id_fkey(*),
      team2:tournament_teams!tournament_matches_team2_id_fkey(*)
    `)
    .in('match_number', [125, 127])
    .order('match_number');
  
  console.log('\n📋 CURRENT BOYS SEMI-FINALS:');
  console.log('-'.repeat(60));
  
  semiFinals?.forEach(match => {
    console.log(`Match #${match.match_number}: ${match.team1?.team_name || 'EMPTY'} vs ${match.team2?.team_name || 'EMPTY'}`);
    if (match.metadata?.progression_method) {
      console.log(`  Method: ${match.metadata.progression_method}`);
    }
    if (match.metadata?.team1_record) {
      console.log(`  ${match.team1?.team_name}: ${match.metadata.team1_record}`);
    }
    if (match.metadata?.team2_record) {
      console.log(`  ${match.team2?.team_name}: ${match.metadata.team2_record}`);
    }
  });
  
  // Verify these are the correct teams based on standings
  console.log('\n✅ VERIFICATION:');
  console.log('-'.repeat(60));
  
  const expectedTeams = {
    125: ['CHENG (B)', 'CHABAU (B)'],
    127: ['YU HWA (B)', 'BKT BERUANG (B)']
  };
  
  let allCorrect = true;
  
  semiFinals?.forEach(match => {
    const expected = expectedTeams[match.match_number];
    const actual = [match.team1?.team_name, match.team2?.team_name];
    
    const isCorrect = expected && 
      actual.includes(expected[0]) && 
      actual.includes(expected[1]);
    
    if (isCorrect) {
      console.log(`✅ Match #${match.match_number}: Correct teams`);
    } else {
      console.log(`❌ Match #${match.match_number}: Incorrect teams`);
      console.log(`   Expected: ${expected?.join(' vs ')}`);
      console.log(`   Actual: ${actual.filter(Boolean).join(' vs ') || 'EMPTY'}`);
      allCorrect = false;
    }
  });
  
  console.log('\n' + '=' .repeat(60));
  if (allCorrect) {
    console.log('🎉 SUCCESS: Boys semi-finals have correct teams!');
    console.log('The progression logic is working correctly.');
  } else {
    console.log('⚠️  WARNING: Semi-finals need correction.');
    console.log('Run the recalculate-boys-semis.js script to fix.');
  }
  
  // Check if any second round matches are still pending
  const { data: pendingMatches } = await supabase
    .from('tournament_matches')
    .select('match_number')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('round', 2)
    .eq('metadata->>division', 'boys')
    .eq('status', 'pending');
  
  if (pendingMatches && pendingMatches.length > 0) {
    console.log(`\n⚠️  Note: ${pendingMatches.length} boys second round matches are still pending.`);
    console.log('Complete all second round matches before using automatic progression.');
  }
}

testBoysProgression().catch(console.error);