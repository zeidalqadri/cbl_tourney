#!/usr/bin/env node

/**
 * Tournament Validation Tool
 * Checks for data integrity issues and provides fixes
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666';

async function validateTournament() {
  console.log('🔍 TOURNAMENT VALIDATION TOOL\n');
  console.log('=' .repeat(50));
  
  const issues = [];
  
  // Check 1: Teams in multiple rounds
  console.log('\n1. Checking for teams in multiple knockout rounds...');
  
  const { data: knockoutMatches } = await supabase
    .from('tournament_matches')
    .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
    .eq('tournament_id', TOURNAMENT_ID)
    .gte('round', 2)
    .order('round');
  
  const teamRounds = new Map();
  
  knockoutMatches?.forEach(match => {
    if (match.team1_id) {
      const key = `${match.team1_id}-${match.round}`;
      if (!teamRounds.has(match.team1_id)) {
        teamRounds.set(match.team1_id, []);
      }
      teamRounds.get(match.team1_id).push({
        round: match.round,
        matchNumber: match.match_number,
        teamName: match.team1?.team_name
      });
    }
    
    if (match.team2_id) {
      const key = `${match.team2_id}-${match.round}`;
      if (!teamRounds.has(match.team2_id)) {
        teamRounds.set(match.team2_id, []);
      }
      teamRounds.get(match.team2_id).push({
        round: match.round,
        matchNumber: match.match_number,
        teamName: match.team2?.team_name
      });
    }
  });
  
  // Find teams in multiple matches at same round
  let duplicateFound = false;
  teamRounds.forEach((matches, teamId) => {
    const roundCounts = {};
    matches.forEach(m => {
      roundCounts[m.round] = (roundCounts[m.round] || 0) + 1;
    });
    
    Object.entries(roundCounts).forEach(([round, count]) => {
      if (count > 1) {
        duplicateFound = true;
        const teamName = matches[0].teamName;
        console.log(`   ⚠️  ${teamName} appears ${count} times in round ${round}`);
        issues.push(`Duplicate: ${teamName} in round ${round}`);
      }
    });
  });
  
  if (!duplicateFound) {
    console.log('   ✅ No teams found in multiple matches at same round');
  }
  
  // Check 2: Progression validity
  console.log('\n2. Checking progression paths...');
  
  let progressionIssues = 0;
  knockoutMatches?.forEach(match => {
    if (match.round === 4 && (match.team1_id || match.team2_id)) {
      // Check if teams in finals actually won semi-finals
      const team1InSemi = knockoutMatches.find(m => 
        m.round === 3 && 
        (m.team1_id === match.team1_id || m.team2_id === match.team1_id) &&
        m.winner_id === match.team1_id
      );
      
      const team2InSemi = knockoutMatches.find(m => 
        m.round === 3 && 
        (m.team1_id === match.team2_id || m.team2_id === match.team2_id) &&
        m.winner_id === match.team2_id
      );
      
      if (match.team1_id && !team1InSemi) {
        console.log(`   ⚠️  Team in final match #${match.match_number} (team1) didn't win semi-final`);
        progressionIssues++;
      }
      
      if (match.team2_id && !team2InSemi) {
        console.log(`   ⚠️  Team in final match #${match.match_number} (team2) didn't win semi-final`);
        progressionIssues++;
      }
    }
  });
  
  if (progressionIssues === 0) {
    console.log('   ✅ All progression paths are valid');
  } else {
    issues.push(`${progressionIssues} invalid progressions found`);
  }
  
  // Check 3: Match completeness
  console.log('\n3. Checking match completeness...');
  
  const incompleteWithScores = knockoutMatches?.filter(m => 
    m.status === 'pending' && 
    ((m.score1 && m.score1 > 0) || (m.score2 && m.score2 > 0))
  );
  
  if (incompleteWithScores?.length > 0) {
    console.log(`   ⚠️  ${incompleteWithScores.length} matches have scores but status is pending:`);
    incompleteWithScores.forEach(m => {
      console.log(`      - Match #${m.match_number}: ${m.score1}-${m.score2}`);
      issues.push(`Match #${m.match_number} has scores but pending status`);
    });
  } else {
    console.log('   ✅ All matches with scores are properly completed');
  }
  
  // Check 4: Winner consistency
  console.log('\n4. Checking winner consistency...');
  
  const completedMatches = knockoutMatches?.filter(m => m.status === 'completed');
  let winnerIssues = 0;
  
  completedMatches?.forEach(match => {
    const expectedWinner = match.score1 > match.score2 ? match.team1_id : 
                          match.score2 > match.score1 ? match.team2_id : null;
    
    if (expectedWinner && match.winner_id !== expectedWinner) {
      console.log(`   ⚠️  Match #${match.match_number}: Winner mismatch`);
      console.log(`      Score: ${match.score1}-${match.score2}, Winner set: ${match.winner_id === match.team1_id ? 'team1' : 'team2'}`);
      winnerIssues++;
      issues.push(`Match #${match.match_number} winner mismatch`);
    }
  });
  
  if (winnerIssues === 0) {
    console.log('   ✅ All winners correctly set based on scores');
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('VALIDATION SUMMARY\n');
  
  if (issues.length === 0) {
    console.log('✅ Tournament data is valid! No issues found.');
  } else {
    console.log(`⚠️  Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    
    console.log('\nRun with --fix flag to attempt automatic fixes');
  }
  
  return issues;
}

async function fixIssues() {
  console.log('\n🔧 ATTEMPTING AUTOMATIC FIXES...\n');
  
  // Fix matches with scores but pending status
  const { data: pendingWithScores } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('status', 'pending')
    .or('score1.gt.0,score2.gt.0');
  
  for (const match of pendingWithScores || []) {
    if ((match.score1 && match.score1 > 0) || (match.score2 && match.score2 > 0)) {
      const winnerId = match.score1 > match.score2 ? match.team1_id :
                      match.score2 > match.score1 ? match.team2_id : null;
      
      await supabase
        .from('tournament_matches')
        .update({
          status: 'completed',
          winner_id: winnerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', match.id);
      
      console.log(`✅ Fixed match #${match.match_number}: Set to completed with winner`);
    }
  }
  
  console.log('\n✨ Fixes applied. Run validation again to verify.');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  
  const issues = await validateTournament();
  
  if (shouldFix && issues.length > 0) {
    await fixIssues();
  }
}

main().catch(console.error);