import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Match progression mapping based on tournament structure
const progressionMap = {
  // Boys Quarter-Finals to Semi-Finals
  137: { to: 145, position: 'home' }, // Boys QF1 winner -> SF1 home
  138: { to: 145, position: 'away' }, // Boys QF2 winner -> SF1 away
  139: { to: 146, position: 'home' }, // Boys QF3 winner -> SF2 home
  140: { to: 146, position: 'away' }, // Boys QF4 winner -> SF2 away
  141: { to: 147, position: 'home' }, // Boys QF5 winner -> SF3 home
  142: { to: 147, position: 'away' }, // Boys QF6 winner -> SF3 away
  143: { to: 148, position: 'home' }, // Boys QF7 winner -> SF4 home
  144: { to: 148, position: 'away' }, // Boys QF8 winner -> SF4 away
  
  // Boys Semi-Finals to Finals
  145: { to: 149, position: 'home' }, // Boys SF1 winner -> 3rd place home
  146: { to: 149, position: 'away' }, // Boys SF2 winner -> 3rd place away
  147: { to: 150, position: 'home' }, // Boys SF3 winner -> Final home
  148: { to: 150, position: 'away' }, // Boys SF4 winner -> Final away
  
  // Girls Quarter-Finals to Semi-Finals
  237: { to: 245, position: 'home' }, // Girls QF1 winner -> SF1 home
  238: { to: 245, position: 'away' }, // Girls QF2 winner -> SF1 away
  239: { to: 246, position: 'home' }, // Girls QF3 winner -> SF2 home
  240: { to: 246, position: 'away' }, // Girls QF4 winner -> SF2 away
  241: { to: 247, position: 'home' }, // Girls QF5 winner -> SF3 home
  242: { to: 247, position: 'away' }, // Girls QF6 winner -> SF3 away
  243: { to: 248, position: 'home' }, // Girls QF7 winner -> SF4 home
  244: { to: 248, position: 'away' }, // Girls QF8 winner -> SF4 away
  
  // Girls Semi-Finals to Finals
  245: { to: 249, position: 'home' }, // Girls SF1 winner -> 3rd place home
  246: { to: 249, position: 'away' }, // Girls SF2 winner -> 3rd place away
  247: { to: 250, position: 'home' }, // Girls SF3 winner -> Final home
  248: { to: 250, position: 'away' }, // Girls SF4 winner -> Final away
};

async function checkAndFixProgression() {
  console.log('================================================');
  console.log('CHECKING AND FIXING TOURNAMENT PROGRESSION');
  console.log('================================================\n');

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

  console.log('Found ' + completedMatches.length + ' completed matches that should advance winners\n');

  let fixCount = 0;
  let alreadySetCount = 0;

  for (const match of completedMatches) {
    const progression = progressionMap[match.match_number];
    if (!progression) continue;

    // Determine winner
    const winnerId = match.home_score > match.away_score 
      ? match.home_team_id 
      : match.away_team_id;

    if (!winnerId) {
      console.log('Match ' + match.match_number + ': No winner determined (tie or no teams)');
      continue;
    }

    // Check if next match already has this team
    const { data: nextMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('match_number', progression.to)
      .single();

    if (!nextMatch) {
      console.log('Match ' + progression.to + ' not found');
      continue;
    }

    const teamField = progression.position === 'home' ? 'home_team_id' : 'away_team_id';
    
    if (nextMatch[teamField] === winnerId) {
      console.log('Match ' + match.match_number + ' -> ' + progression.to + ': Already set correctly');
      alreadySetCount++;
      continue;
    }

    // Update the next match with the winner
    const updateData = {};
    updateData[teamField] = winnerId;

    const { error: updateError } = await supabase
      .from('matches')
      .update(updateData)
      .eq('match_number', progression.to);

    if (updateError) {
      console.error('Error updating match ' + progression.to + ':', updateError);
    } else {
      console.log('✅ Match ' + match.match_number + ' winner -> Match ' + progression.to + ' (' + progression.position + ')');
      fixCount++;
    }
  }

  // Show current status of all semi-finals and finals
  console.log('\n================================================');
  console.log('CURRENT STATUS OF KNOCKOUT ROUNDS');
  console.log('================================================\n');

  const knockoutMatches = [145, 146, 147, 148, 149, 150, 245, 246, 247, 248, 249, 250];
  const { data: knockouts } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
    .in('match_number', knockoutMatches)
    .order('match_number');

  if (knockouts) {
    console.log('BOYS KNOCKOUT:');
    knockouts.filter(m => m.match_number <= 150).forEach(m => {
      const round = m.match_number <= 148 ? 'Semi-Final' : m.match_number === 149 ? '3rd Place' : 'Final';
      console.log('  Match ' + m.match_number + ' (' + round + '): ' + 
                  (m.home_team?.name || 'TBD') + ' vs ' + 
                  (m.away_team?.name || 'TBD') + ' - ' + m.status);
    });

    console.log('\nGIRLS KNOCKOUT:');
    knockouts.filter(m => m.match_number >= 245).forEach(m => {
      const round = m.match_number <= 248 ? 'Semi-Final' : m.match_number === 249 ? '3rd Place' : 'Final';
      console.log('  Match ' + m.match_number + ' (' + round + '): ' + 
                  (m.home_team?.name || 'TBD') + ' vs ' + 
                  (m.away_team?.name || 'TBD') + ' - ' + m.status);
    });
  }

  console.log('\n================================================');
  console.log('SUMMARY');
  console.log('================================================');
  console.log('Progressions fixed: ' + fixCount);
  console.log('Already correct: ' + alreadySetCount);
  console.log('Total processed: ' + (fixCount + alreadySetCount));
  
  if (fixCount > 0) {
    console.log('\n✅ Progression has been updated successfully!');
  } else if (alreadySetCount > 0) {
    console.log('\n✅ All progressions are already set correctly!');
  } else {
    console.log('\n⚠️  No completed matches found that need progression.');
    console.log('Complete more quarter-final matches to see auto-progression.');
  }
}

checkAndFixProgression().catch(console.error);