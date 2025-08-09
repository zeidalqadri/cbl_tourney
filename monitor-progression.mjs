#!/usr/bin/env node

// Real-time monitor for tournament progression
// Watches for match completions and ensures winners advance

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tnglzpywvtafomngxsgc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs';
const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔄 Tournament Progression Monitor Started');
console.log('=' .repeat(50));
console.log('Watching for match completions...\n');

// Subscribe to match status changes
const subscription = supabase
  .channel('match-progression')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'tournament_matches',
      filter: `tournament_id=eq.${TOURNAMENT_ID}`
    },
    async (payload) => {
      const match = payload.new;
      const oldMatch = payload.old;
      
      // Check if match just completed
      if (match.status === 'completed' && oldMatch.status !== 'completed') {
        console.log(`\n🏆 Match #${match.match_number} completed!`);
        console.log(`   Score: ${match.score1} - ${match.score2}`);
        
        // The database trigger should handle progression automatically
        // But let's verify it worked
        if (match.advances_to_match_id) {
          setTimeout(async () => {
            const { data: nextMatch } = await supabase
              .from('tournament_matches')
              .select(`
                match_number,
                team1_id,
                team2_id,
                team1:tournament_teams!tournament_matches_team1_id_fkey(team_name),
                team2:tournament_teams!tournament_matches_team2_id_fkey(team_name)
              `)
              .eq('id', match.advances_to_match_id)
              .single();
              
            if (nextMatch) {
              const position = match.metadata?.advances_to_position || 'unknown';
              const team = position === 'team1' ? nextMatch.team1?.team_name : nextMatch.team2?.team_name;
              
              if (team && team !== 'TBD') {
                console.log(`   ✅ Winner advanced to Match #${nextMatch.match_number} as ${position}: ${team}`);
              } else {
                console.log(`   ⚠️  Progression may need manual fix for Match #${nextMatch.match_number}`);
              }
            }
          }, 2000); // Wait 2 seconds for trigger to complete
        }
        
        // Check if this was a group stage match that completes a group
        if (match.metadata?.type === 'group_stage' && match.metadata?.group) {
          console.log(`   📋 Group ${match.metadata.group} match completed`);
          // Group winners are handled by separate logic
        }
      }
    }
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Subscribed to match updates\n');
    }
  });

// Show current tournament status on startup
async function showStatus() {
  const { data: pendingMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, metadata')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'pending')
    .order('match_number');
    
  const knockoutPending = pendingMatches?.filter(m => 
    m.match_number >= 124 && m.match_number <= 129
  );
  
  console.log('📊 Current Status:');
  console.log(`   Pending matches: ${pendingMatches?.length || 0}`);
  console.log(`   Knockout matches pending: ${knockoutPending?.length || 0}`);
  
  if (knockoutPending && knockoutPending.length > 0) {
    console.log('\n   Next knockout matches:');
    for (const match of knockoutPending.slice(0, 3)) {
      const type = match.metadata?.type || 'Unknown';
      console.log(`      Match #${match.match_number} (${type})`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('Press Ctrl+C to stop monitoring\n');
}

showStatus();

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping progression monitor...');
  subscription.unsubscribe();
  process.exit(0);
});