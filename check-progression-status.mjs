import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProgressionStatus() {
  console.log('===========================================');
  console.log('TOURNAMENT AUTO-PROGRESSION STATUS CHECK');
  console.log('===========================================\n');

  // Check both boys and girls matches
  const { data: allMatches, error } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .order('match_number');
  
  if (error) {
    console.error('Error fetching matches:', error);
    return;
  }

  const boysMatches = allMatches.filter(m => m.match_number >= 101 && m.match_number <= 150);
  const girlsMatches = allMatches.filter(m => m.match_number >= 201 && m.match_number <= 250);

  // Check Boys Tournament
  console.log('BOYS TOURNAMENT STATUS:');
  console.log('=======================');
  
  const boysRounds = {
    'First Round (101-124)': boysMatches.filter(m => m.match_number >= 101 && m.match_number <= 124),
    'Second Round (125-136)': boysMatches.filter(m => m.match_number >= 125 && m.match_number <= 136),
    'Quarter-Finals (137-144)': boysMatches.filter(m => m.match_number >= 137 && m.match_number <= 144),
    'Semi-Finals (145-148)': boysMatches.filter(m => [145, 146, 147, 148].includes(m.match_number)),
    'Finals (149-150)': boysMatches.filter(m => [149, 150].includes(m.match_number))
  };
  
  for (const [round, matches] of Object.entries(boysRounds)) {
    const completed = matches.filter(m => m.status === 'completed').length;
    const scheduled = matches.filter(m => m.status === 'scheduled').length;
    const pending = matches.filter(m => m.status === 'pending').length;
    const teamsSet = matches.filter(m => m.home_team_id && m.away_team_id).length;
    
    console.log('\n' + round + ':');
    console.log('  Total: ' + matches.length + ' | Completed: ' + completed + ' | Scheduled: ' + scheduled + ' | Pending: ' + pending);
    console.log('  Teams Set: ' + teamsSet + '/' + matches.length);
    
    // Show matches without teams
    const noTeams = matches.filter(m => !m.home_team_id || !m.away_team_id);
    if (noTeams.length > 0) {
      console.log('  Missing Teams: Matches ' + noTeams.map(m => m.match_number).join(', '));
    }
  }

  // Check Girls Tournament
  console.log('\n\nGIRLS TOURNAMENT STATUS:');
  console.log('========================');
  
  const girlsRounds = {
    'First Round (201-224)': girlsMatches.filter(m => m.match_number >= 201 && m.match_number <= 224),
    'Second Round (225-236)': girlsMatches.filter(m => m.match_number >= 225 && m.match_number <= 236),
    'Quarter-Finals (237-244)': girlsMatches.filter(m => m.match_number >= 237 && m.match_number <= 244),
    'Semi-Finals (245-248)': girlsMatches.filter(m => [245, 246, 247, 248].includes(m.match_number)),
    'Finals (249-250)': girlsMatches.filter(m => [249, 250].includes(m.match_number))
  };
  
  for (const [round, matches] of Object.entries(girlsRounds)) {
    const completed = matches.filter(m => m.status === 'completed').length;
    const scheduled = matches.filter(m => m.status === 'scheduled').length;
    const pending = matches.filter(m => m.status === 'pending').length;
    const teamsSet = matches.filter(m => m.home_team_id && m.away_team_id).length;
    
    console.log('\n' + round + ':');
    console.log('  Total: ' + matches.length + ' | Completed: ' + completed + ' | Scheduled: ' + scheduled + ' | Pending: ' + pending);
    console.log('  Teams Set: ' + teamsSet + '/' + matches.length);
    
    // Show matches without teams
    const noTeams = matches.filter(m => !m.home_team_id || !m.away_team_id);
    if (noTeams.length > 0) {
      console.log('  Missing Teams: Matches ' + noTeams.map(m => m.match_number).join(', '));
    }
  }

  // Check specific semi-finals that should be populated
  console.log('\n\nSPECIFIC SEMI-FINALS CHECK:');
  console.log('============================');
  
  const semiFinals = [
    { match: 145, desc: 'Boys Semi-Final 1' },
    { match: 146, desc: 'Boys Semi-Final 2' },
    { match: 147, desc: 'Boys Semi-Final 3' },
    { match: 148, desc: 'Boys Semi-Final 4' },
    { match: 245, desc: 'Girls Semi-Final 1' },
    { match: 246, desc: 'Girls Semi-Final 2' },
    { match: 247, desc: 'Girls Semi-Final 3' },
    { match: 248, desc: 'Girls Semi-Final 4' }
  ];
  
  for (const sf of semiFinals) {
    const match = allMatches.find(m => m.match_number === sf.match);
    console.log('\n' + sf.desc + ' (Match ' + sf.match + '):');
    console.log('  Status: ' + (match?.status || 'N/A'));
    console.log('  Home: ' + (match?.home_team?.name || 'NOT SET') + ' (ID: ' + (match?.home_team_id || 'null') + ')');
    console.log('  Away: ' + (match?.away_team?.name || 'NOT SET') + ' (ID: ' + (match?.away_team_id || 'null') + ')');
    if (match?.home_score !== null || match?.away_score !== null) {
      console.log('  Score: ' + (match.home_score || 0) + ' - ' + (match.away_score || 0));
    }
  }

  // Check which quarter-finals are completed (these feed into semi-finals)
  console.log('\n\nQUARTER-FINALS COMPLETION STATUS:');
  console.log('==================================');
  
  const boysQF = boysMatches.filter(m => m.match_number >= 137 && m.match_number <= 144);
  const girlsQF = girlsMatches.filter(m => m.match_number >= 237 && m.match_number <= 244);
  
  console.log('\nBoys Quarter-Finals:');
  for (const match of boysQF) {
    const winner = match.status === 'completed' 
      ? (match.home_score > match.away_score ? match.home_team?.name : match.away_team?.name)
      : 'TBD';
    console.log('  Match ' + match.match_number + ': ' + (match.home_team?.name || 'TBD') + ' vs ' + (match.away_team?.name || 'TBD') + ' - ' + match.status + ' - Winner: ' + winner);
  }
  
  console.log('\nGirls Quarter-Finals:');
  for (const match of girlsQF) {
    const winner = match.status === 'completed' 
      ? (match.home_score > match.away_score ? match.home_team?.name : match.away_team?.name)
      : 'TBD';
    console.log('  Match ' + match.match_number + ': ' + (match.home_team?.name || 'TBD') + ' vs ' + (match.away_team?.name || 'TBD') + ' - ' + match.status + ' - Winner: ' + winner);
  }
}

checkProgressionStatus();