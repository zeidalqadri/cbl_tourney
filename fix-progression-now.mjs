import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use the service role key from the run-sql-direct.mjs file
const supabase = createClient(
  'https://tnglzpywvtafomngxsgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkzODUxNSwiZXhwIjoyMDYwNTE0NTE1fQ.Tk4IwZRAbxTNS4kBlMCHaxaSdIoE_JBWbnSmQ7VKjAQ'
);

// Match progression mapping
const progressionMap = {
  // Boys Quarter-Finals to Semi-Finals
  137: { to: 145, position: 'home' },
  138: { to: 145, position: 'away' },
  139: { to: 146, position: 'home' },
  140: { to: 146, position: 'away' },
  141: { to: 147, position: 'home' },
  142: { to: 147, position: 'away' },
  143: { to: 148, position: 'home' },
  144: { to: 148, position: 'away' },
  
  // Boys Semi-Finals to Finals
  145: { to: 149, position: 'home' },
  146: { to: 149, position: 'away' },
  147: { to: 150, position: 'home' },
  148: { to: 150, position: 'away' },
  
  // Girls Quarter-Finals to Semi-Finals
  237: { to: 245, position: 'home' },
  238: { to: 245, position: 'away' },
  239: { to: 246, position: 'home' },
  240: { to: 246, position: 'away' },
  241: { to: 247, position: 'home' },
  242: { to: 247, position: 'away' },
  243: { to: 248, position: 'home' },
  244: { to: 248, position: 'away' },
  
  // Girls Semi-Finals to Finals
  245: { to: 249, position: 'home' },
  246: { to: 249, position: 'away' },
  247: { to: 250, position: 'home' },
  248: { to: 250, position: 'away' },
};

async function fixProgression() {
  console.log('🔧 FIXING TOURNAMENT PROGRESSION\n');
  console.log('=' .repeat(50));

  // Get all completed matches that should advance
  const completedMatchNumbers = Object.keys(progressionMap).map(Number);
  const { data: completedMatches, error: fetchError } = await supabase
    .from('matches')
    .select('*')
    .in('match_number', completedMatchNumbers)
    .eq('status', 'completed');

  if (fetchError) {
    console.error('Error fetching matches:', fetchError);
    return;
  }

  console.log('Found ' + completedMatches.length + ' completed matches\n');

  let updates = [];
  
  for (const match of completedMatches) {
    const progression = progressionMap[match.match_number];
    if (!progression) continue;

    // Determine winner
    const winnerId = match.home_score > match.away_score 
      ? match.home_team_id 
      : match.away_team_id;

    if (!winnerId) {
      console.log('Match ' + match.match_number + ': No winner (tie or no teams)');
      continue;
    }

    updates.push({
      sourceMatch: match.match_number,
      targetMatch: progression.to,
      position: progression.position,
      winnerId: winnerId
    });
  }

  // Apply all updates
  console.log('Applying ' + updates.length + ' progressions...\n');
  
  for (const update of updates) {
    const updateData = {};
    if (update.position === 'home') {
      updateData.home_team_id = update.winnerId;
    } else {
      updateData.away_team_id = update.winnerId;
    }

    const { error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('match_number', update.targetMatch);

    if (error) {
      console.error('❌ Error updating match ' + update.targetMatch + ':', error.message);
    } else {
      console.log('✅ Match ' + update.sourceMatch + ' winner → Match ' + update.targetMatch + ' (' + update.position + ')');
    }
  }

  // Show final status
  console.log('\n' + '=' .repeat(50));
  console.log('KNOCKOUT ROUNDS STATUS\n');

  const knockoutMatches = [145, 146, 147, 148, 149, 150, 245, 246, 247, 248, 249, 250];
  const { data: knockouts } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
    .in('match_number', knockoutMatches)
    .order('match_number');

  if (knockouts) {
    console.log('BOYS:');
    knockouts.filter(m => m.match_number <= 150).forEach(m => {
      const round = m.match_number <= 148 ? 'SF' : m.match_number === 149 ? '3rd' : 'Final';
      const teams = (m.home_team?.name || 'TBD') + ' vs ' + (m.away_team?.name || 'TBD');
      console.log('  M' + m.match_number + ' (' + round + '): ' + teams);
    });

    console.log('\nGIRLS:');
    knockouts.filter(m => m.match_number >= 245).forEach(m => {
      const round = m.match_number <= 248 ? 'SF' : m.match_number === 249 ? '3rd' : 'Final';
      const teams = (m.home_team?.name || 'TBD') + ' vs ' + (m.away_team?.name || 'TBD');
      console.log('  M' + m.match_number + ' (' + round + '): ' + teams);
    });
  }

  console.log('\n✅ Progression fix complete!');
}

fixProgression().catch(console.error);