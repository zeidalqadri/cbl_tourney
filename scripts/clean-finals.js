#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanDatabase() {
  console.log('🧹 Cleaning database...\n');
  
  // Remove CHABAU from finals
  console.log('Removing CHABAU (G) from Match #128...');
  const { error } = await supabase
    .from('tournament_matches')
    .update({ 
      team2_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('match_number', 128);
  
  if (!error) {
    console.log('✅ Removed CHABAU from Match #128');
  } else {
    console.log('❌ Error:', error);
  }
  
  // Check current state
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('match_number, round, team1_id, team2_id, status, metadata')
    .in('match_number', [124, 125, 127, 128, 129])
    .order('match_number');
  
  console.log('\nCurrent match status:');
  console.log('=' .repeat(50));
  
  matches?.forEach(m => {
    const type = m.metadata?.type || 'unknown';
    const team1 = m.team1_id ? 'SET' : 'empty';
    const team2 = m.team2_id ? 'SET' : 'empty';
    console.log(`Match #${m.match_number} (${type}): Team1=${team1}, Team2=${team2}, Status=${m.status}`);
  });
  
  console.log('\n✨ Database cleaned. Finals are now empty and waiting for semi-final winners.');
}

cleanDatabase().catch(console.error);