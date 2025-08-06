#!/usr/bin/env node

// Direct sync script using Supabase JS client
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Match data from PDF
const boysMatches = [
  // August 4, 2025 - SJKC YU HWA (Gelanggang A)
  { match_number: 1, team1: 'YU HWA', team2: 'YU YING', score1: 21, score2: 9, group: 'LH' },
  { match_number: 3, team1: 'ST MARY', team2: 'BACHANG', score1: 2, score2: 46, group: 'LJ' },
  { match_number: 5, team1: 'PAY MIN', team2: 'SIN WAH', score1: 4, score2: 40, group: 'LK' },
  { match_number: 7, team1: 'MERLIMAU', team2: 'CHIAO CHEE', score1: 20, score2: 2, group: 'LI' },
  { match_number: 9, team1: 'YU YING', team2: 'TIANG DUA', score1: 14, score2: 2, group: 'LH' },
  { match_number: 11, team1: 'BACHANG', team2: 'LENDU', score1: 22, score2: 0, group: 'LJ' },
  { match_number: 13, team1: 'SIN WAH', team2: 'PAY CHIAO', score1: 3, score2: 48, group: 'LK' },
  { match_number: 15, team1: 'CHIAO CHEE', team2: 'JASIN LALANG', score1: 4, score2: 3, group: 'LI' },
  { match_number: 17, team1: 'TIANG DUA', team2: 'YU HWA', score1: 0, score2: 23, group: 'LH' },
  { match_number: 19, team1: 'LENDU', team2: 'ST MARY', score1: 7, score2: 0, group: 'LJ' },
  { match_number: 21, team1: 'PAY CHIAO', team2: 'PAY MIN', score1: 19, score2: 6, group: 'LK' },
  { match_number: 23, team1: 'JASIN LALANG', team2: 'MERLIMAU', score1: 4, score2: 14, group: 'LI' },
  { match_number: 25, team1: 'YU HSIEN', team2: 'PAY CHUIN', score1: 38, score2: 2, group: 'LL' },
  { match_number: 27, team1: 'KIOW MIN', team2: 'PAY TECK', score1: 7, score2: 4, group: 'LM' },
  { match_number: 29, team1: 'PAY FONG 2', team2: 'PAY HWA', score1: 13, score2: 5, group: 'LN' },
  { match_number: 31, team1: 'PAY CHUIN', team2: 'KATHOLIK', score1: 4, score2: 28, group: 'LL' },
  { match_number: 33, team1: 'PAY TECK', team2: 'BKT BERUANG', score1: 4, score2: 24, group: 'LM' },
  { match_number: 35, team1: 'PAY HWA', team2: 'KUANG YAH', score1: 20, score2: 6, group: 'LN' },
  { match_number: 37, team1: 'KATHOLIK', team2: 'YU HSIEN', score1: 6, score2: 20, group: 'LL' },
  { match_number: 39, team1: 'BKT BERUANG', team2: 'KIOW MIN', score1: 18, score2: 7, group: 'LM' },
  { match_number: 41, team1: 'KUANG YAH', team2: 'PAY FONG 2', score1: 3, score2: 28, group: 'LN' },
  // August 4, 2025 - SJKC MALIM (Gelanggang B)
  { match_number: 2, team1: 'MALIM', team2: 'TING HWA', score1: 40, score2: 2, group: 'LA' },
  { match_number: 4, team1: 'WEN HUA', team2: 'AYER KEROH', score1: 12, score2: 2, group: 'LB' },
  { match_number: 6, team1: 'CHENG', team2: 'SHUH YEN', score1: 45, score2: 2, group: 'LC' },
  { match_number: 8, team1: 'TING HWA', team2: 'BERTAM ULU', score1: 2, score2: 27, group: 'LA' },
  { match_number: 10, team1: 'AYER KEROH', team2: 'SIANG LIN', score1: 30, score2: 0, group: 'LB' },
  { match_number: 12, team1: 'SHUH YEN', team2: 'MASJID TANAH', score1: 2, score2: 19, group: 'LC' },
  { match_number: 14, team1: 'BERTAM ULU', team2: 'MALIM', score1: 6, score2: 15, group: 'LA' },
  { match_number: 16, team1: 'SIANG LIN', team2: 'WEN HUA', score1: 0, score2: 37, group: 'LB' },
  { match_number: 18, team1: 'MASJID TANAH', team2: 'CHENG', score1: 2, score2: 28, group: 'LC' },
  { match_number: 20, team1: 'PAYA MENGKUANG', team2: 'POH LAN', score1: 4, score2: 9, group: 'LD' },
  { match_number: 22, team1: 'PONDOK BATANG', team2: 'CHABAU', score1: 3, score2: 26, group: 'LD' },
  { match_number: 24, team1: 'PAY CHEE', team2: 'PING MING', score1: 7, score2: 4, group: 'LE' },
  { match_number: 26, team1: 'SG UDANG', team2: 'MACHAP UMBOO', score1: 2, score2: 10, group: 'LF' },
  { match_number: 28, team1: 'PAY FONG 1', team2: 'KEH SENG', score1: 21, score2: 0, group: 'LG' },
  { match_number: 30, team1: 'PAYA MENGKUANG', team2: 'PONDOK BATANG', score1: 10, score2: 14, group: 'LD' },
  { match_number: 32, team1: 'POH LAN', team2: 'CHABAU', score1: 2, score2: 20, group: 'LD' },
  { match_number: 34, team1: 'PING MING', team2: 'CHUNG HWA', score1: 0, score2: 22, group: 'LE' },
  { match_number: 36, team1: 'MACHAP UMBOO', team2: 'ALOR GAJAH', score1: 8, score2: 19, group: 'LF' },
  { match_number: 38, team1: 'KEH SENG', team2: 'MACHAP BARU', score1: 19, score2: 8, group: 'LG' },
  { match_number: 40, team1: 'CHABAU', team2: 'PAYA MENGKUANG', score1: 18, score2: 2, group: 'LD' },
  { match_number: 42, team1: 'PONDOK BATANG', team2: 'POH LAN', score1: 16, score2: 18, group: 'LD' },
  { match_number: 43, team1: 'CHUNG HWA', team2: 'PAY CHEE', score1: 8, score2: 10, group: 'LE' },
  { match_number: 44, team1: 'ALOR GAJAH', team2: 'SG UDANG', score1: 20, score2: 2, group: 'LF' },
  { match_number: 45, team1: 'MACHAP BARU', team2: 'PAY FONG 1', score1: 6, score2: 38, group: 'LG' },
]

const girlsMatches = [
  // August 5, 2025 - SJKC YU HWA (Gelanggang A)
  { match_number: 46, team1: 'YU HWA', team2: 'KEH SENG', score1: 0, score2: 16, group: 'PA' },
  { match_number: 48, team1: 'PAY FONG 1', team2: 'SG UDANG', score1: 20, score2: 0, group: 'PA' },
  { match_number: 50, team1: 'PAY CHIAO', team2: 'PING MING', score1: 6, score2: 0, group: 'PB' },
  { match_number: 52, team1: 'YU HSIEN', team2: 'CHUNG HWA', score1: 4, score2: 26, group: 'PB' },
  { match_number: 54, team1: 'BKT BERUANG', team2: 'YU YING', score1: 22, score2: 0, group: 'PC' },
  { match_number: 56, team1: 'PAY FONG 2', team2: 'NOTRE DAME', score1: 16, score2: 10, group: 'PC' },
  { match_number: 58, team1: 'CHABAU', team2: 'JASIN LALANG', score1: 25, score2: 2, group: 'PD' },
  { match_number: 60, team1: 'YING CHYE', team2: 'PONDOK BATANG', score1: 6, score2: 22, group: 'PD' },
  { match_number: 62, team1: 'PING MING', team2: 'KUANG YAH', score1: 4, score2: 22, group: 'PB' },
  { match_number: 64, team1: 'CHUNG HWA', team2: 'PAY CHIAO', score1: 14, score2: 8, group: 'PB' },
  { match_number: 66, team1: 'YU HWA', team2: 'PAY FONG 1', score1: 13, score2: 6, group: 'PA' },
  { match_number: 68, team1: 'KEH SENG', team2: 'SG UDANG', score1: 20, score2: 0, group: 'PA' },
  { match_number: 70, team1: 'BKT BERUANG', team2: 'PAY FONG 2', score1: 6, score2: 2, group: 'PC' },
  { match_number: 72, team1: 'YU YING', team2: 'NOTRE DAME', score1: 2, score2: 12, group: 'PC' },
  { match_number: 74, team1: 'KUANG YAH', team2: 'CHUNG HWA', score1: 0, score2: 11, group: 'PB' },
  { match_number: 76, team1: 'PAY CHIAO', team2: 'YU HSIEN', score1: 25, score2: 4, group: 'PB' },
  { match_number: 78, team1: 'CHABAU', team2: 'YING CHYE', score1: 22, score2: 6, group: 'PD' },
  { match_number: 80, team1: 'JASIN LALANG', team2: 'PONDOK BATANG', score1: 4, score2: 9, group: 'PD' },
  { match_number: 82, team1: 'SG UDANG', team2: 'YU HWA', score1: 0, score2: 20, group: 'PA' },
  { match_number: 84, team1: 'PAY FONG 1', team2: 'KEH SENG', score1: 2, score2: 17, group: 'PA' },
  { match_number: 86, team1: 'YU HSIEN', team2: 'KUANG YAH', score1: 10, score2: 22, group: 'PB' },
  { match_number: 88, team1: 'CHUNG HWA', team2: 'PING MING', score1: 18, score2: 2, group: 'PB' },
  { match_number: 90, team1: 'NOTRE DAME', team2: 'BKT BERUANG', score1: 4, score2: 10, group: 'PC' },
  { match_number: 92, team1: 'PAY FONG 2', team2: 'YU YING', score1: 13, score2: 0, group: 'PC' },
  { match_number: 94, team1: 'PONDOK BATANG', team2: 'CHABAU', score1: 5, score2: 22, group: 'PD' },
  { match_number: 96, team1: 'YING CHYE', team2: 'JASIN LALANG', score1: 4, score2: 12, group: 'PD' },
  { match_number: 98, team1: 'PING MING', team2: 'YU HSIEN', score1: 0, score2: 4, group: 'PB' },
  { match_number: 100, team1: 'KUANG YAH', team2: 'PAY CHIAO', score1: 2, score2: 8, group: 'PB' },
  // More girls matches from SJKC MALIM (Gelanggang B)
  { match_number: 47, team1: 'PAY TECK', team2: 'WEN HUA', score1: 17, score2: 2, group: 'PE' },
  { match_number: 49, team1: 'KIOW MIN', team2: 'SIN WAH', score1: 14, score2: 6, group: 'PE' },
  { match_number: 51, team1: 'AYER KEROH', team2: 'POH LAN', score1: 6, score2: 0, group: 'PG' },
  { match_number: 53, team1: 'PAY HWA', team2: 'MALIM', score1: 0, score2: 9, group: 'PG' },
  { match_number: 55, team1: 'TIANG DUA', team2: 'PAY CHEE', score1: 0, score2: 11, group: 'PF' },
  { match_number: 57, team1: 'KUANG HWA', team2: 'CHENG', score1: 0, score2: 22, group: 'PF' },
  { match_number: 59, team1: 'CHIAO CHEE', team2: 'MERLIMAU', score1: 12, score2: 2, group: 'PH' },
  { match_number: 61, team1: 'SHUH YEN', team2: 'MASJID TANAH', score1: 4, score2: 5, group: 'PH' },
  // Continue with remaining matches...
]

async function syncMatches() {
  console.log('🏀 Starting Tournament Data Sync...\n')
  
  let successCount = 0
  let errorCount = 0
  
  // Sync boys matches
  console.log('📊 Syncing Boys Division Matches...')
  for (const match of boysMatches) {
    try {
      // Get team IDs - teams have (B) suffix for boys
      const { data: team1 } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('team_name', `${match.team1} (B)`)
        .eq('division', 'boys')
        .single()
      
      const { data: team2 } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('team_name', `${match.team2} (B)`)
        .eq('division', 'boys')
        .single()
      
      if (!team1 || !team2) {
        console.log(`   ⚠️  Teams not found for match ${match.match_number}: ${match.team1} vs ${match.team2}`)
        errorCount++
        continue
      }
      
      // First check if match exists
      const { data: existingMatch } = await supabase
        .from('tournament_matches')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', match.match_number)
        .single()
      
      let error
      if (existingMatch) {
        // Update existing match
        const { error: updateError } = await supabase
          .from('tournament_matches')
          .update({
            team1_id: team1.id,
            team2_id: team2.id,
            score1: match.score1,
            score2: match.score2,
            status: 'completed',
            metadata: { 
              division: 'boys', 
              group: match.group,
              type: 'group_stage'
            }
          })
          .eq('id', existingMatch.id)
        error = updateError
      } else {
        // Insert new match
        const { error: insertError } = await supabase
          .from('tournament_matches')
          .insert({
            tournament_id: TOURNAMENT_ID,
            match_number: match.match_number,
            team1_id: team1.id,
            team2_id: team2.id,
            score1: match.score1,
            score2: match.score2,
            status: 'completed',
            round: 1,
            metadata: { 
              division: 'boys', 
              group: match.group,
              type: 'group_stage'
            }
          })
        error = insertError
      }
      
      if (error) {
        console.log(`   ❌ Error updating match ${match.match_number}: ${error.message}`)
        errorCount++
      } else {
        successCount++
      }
    } catch (err) {
      console.log(`   ❌ Error processing match ${match.match_number}: ${err.message}`)
      errorCount++
    }
  }
  
  // Sync girls matches
  console.log('\n📊 Syncing Girls Division Matches...')
  for (const match of girlsMatches) {
    try {
      // Get team IDs - teams have (G) suffix for girls
      const { data: team1 } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('team_name', `${match.team1} (G)`)
        .eq('division', 'girls')
        .single()
      
      const { data: team2 } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('team_name', `${match.team2} (G)`)
        .eq('division', 'girls')
        .single()
      
      if (!team1 || !team2) {
        console.log(`   ⚠️  Teams not found for match ${match.match_number}: ${match.team1} vs ${match.team2}`)
        errorCount++
        continue
      }
      
      // First check if match exists
      const { data: existingMatch } = await supabase
        .from('tournament_matches')
        .select('id')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('match_number', match.match_number)
        .single()
      
      let error
      if (existingMatch) {
        // Update existing match
        const { error: updateError } = await supabase
          .from('tournament_matches')
          .update({
            team1_id: team1.id,
            team2_id: team2.id,
            score1: match.score1,
            score2: match.score2,
            status: 'completed',
            metadata: { 
              division: 'girls', 
              group: match.group,
              type: 'group_stage'
            }
          })
          .eq('id', existingMatch.id)
        error = updateError
      } else {
        // Insert new match
        const { error: insertError } = await supabase
          .from('tournament_matches')
          .insert({
            tournament_id: TOURNAMENT_ID,
            match_number: match.match_number,
            team1_id: team1.id,
            team2_id: team2.id,
            score1: match.score1,
            score2: match.score2,
            status: 'completed',
            round: 1,
            metadata: { 
              division: 'girls', 
              group: match.group,
              type: 'group_stage'
            }
          })
        error = insertError
      }
      
      if (error) {
        console.log(`   ❌ Error updating match ${match.match_number}: ${error.message}`)
        errorCount++
      } else {
        successCount++
      }
    } catch (err) {
      console.log(`   ❌ Error processing match ${match.match_number}: ${err.message}`)
      errorCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('SYNC SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully synced: ${successCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
  console.log('\n📋 Next steps:')
  console.log('   1. Run validation: npm run validate-tournament')
  console.log('   2. Check the frontend: npm run dev')
  console.log('   3. Manually run SQL migrations for standings calculation')
  
  process.exit(errorCount > 0 ? 1 : 0)
}

// Run the sync
syncMatches().catch(console.error)