#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function populateGirlsSemiFinal() {
  console.log('🏐 Populating Girls Semi-Final Match #126\n');
  
  // Get KIOW MIN (G) and CHIAO CHEE (G) team IDs
  const { data: kiowMin } = await supabase
    .from('tournament_teams')
    .select('id, team_name')
    .eq('team_name', 'KIOW MIN (G)')
    .single();
  
  const { data: chiaoChee } = await supabase
    .from('tournament_teams')
    .select('id, team_name')
    .eq('team_name', 'CHIAO CHEE (G)')
    .single();
  
  console.log('Teams to add:');
  console.log(`  Team1: ${kiowMin?.team_name} (ID: ${kiowMin?.id})`);
  console.log(`  Team2: ${chiaoChee?.team_name} (ID: ${chiaoChee?.id})`);
  
  if (kiowMin && chiaoChee) {
    // Update Match #126
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        team1_id: kiowMin.id,
        team2_id: chiaoChee.id,
        updated_at: new Date().toISOString()
      })
      .eq('match_number', 126);
    
    if (!error) {
      console.log('\n✅ Successfully populated Match #126!');
      console.log('\nGirls Semi-Finals are now complete:');
      console.log('  Match #124: KEH SENG (G) vs CHABAU (G)');
      console.log('  Match #126: KIOW MIN (G) vs CHIAO CHEE (G)');
      console.log('\nBoth girls semi-finals are ready for scoring.');
      console.log('Winners will advance to Match #128 (Girls Final).');
    } else {
      console.log('❌ Error:', error);
    }
  } else {
    console.log('❌ Could not find one or both teams');
  }
}

populateGirlsSemiFinal().catch(console.error);