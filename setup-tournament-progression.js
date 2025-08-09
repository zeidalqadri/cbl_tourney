#!/usr/bin/env node

// Script to set up tournament progression links
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

// Tournament progression structure
const progressionLinks = {
  girls: {
    quarterFinals: [
      { match: 102, advances_to: 124, position: 'team1' }, // PQF1 winner → SF1 team1
      { match: 109, advances_to: 124, position: 'team2' }, // PQF2 winner → SF1 team2
      { match: 116, advances_to: 126, position: 'team1' }, // PQF3 winner → SF2 team1
      { match: 123, advances_to: 126, position: 'team2' }  // PQF4 winner → SF2 team2
    ],
    semiFinals: [
      { match: 124, advances_to: 128, position: 'team1' }, // SF1 winner → Final team1
      { match: 126, advances_to: 128, position: 'team2' }  // SF2 winner → Final team2
    ]
  },
  boys: {
    // Boys have second round groups first, then semis
    secondRound: [
      // Winners from LXA and LXB groups → SF1
      // Winners from LYA and LYB groups → SF2
      // These will be determined after group completion
    ],
    semiFinals: [
      { match: 125, advances_to: 129, position: 'team1' }, // Boys SF1 winner → Final team1
      { match: 127, advances_to: 129, position: 'team2' }  // Boys SF2 winner → Final team2
    ]
  }
}

async function setupProgression() {
  console.log('🏀 Setting Up Tournament Progression Links...\n')
  
  let updateCount = 0
  let errorCount = 0
  
  // Update girls quarter-finals
  console.log('📊 Linking Girls Quarter-Finals to Semi-Finals...')
  for (const link of progressionLinks.girls.quarterFinals) {
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        advances_to_match_id: await getMatchId(link.advances_to),
        metadata: await supabase
          .from('tournament_matches')
          .select('metadata')
          .eq('tournament_id', TOURNAMENT_ID)
          .eq('match_number', link.match)
          .single()
          .then(res => ({
            ...res.data?.metadata,
            advances_to: link.advances_to,
            advances_to_position: link.position
          }))
      })
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('match_number', link.match)
    
    if (error) {
      console.log(`   ❌ Error linking match #${link.match}: ${error.message}`)
      errorCount++
    } else {
      console.log(`   ✅ Match #${link.match} → Match #${link.advances_to} (${link.position})`)
      updateCount++
    }
  }
  
  // Update girls semi-finals
  console.log('\n📊 Linking Girls Semi-Finals to Final...')
  for (const link of progressionLinks.girls.semiFinals) {
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        advances_to_match_id: await getMatchId(link.advances_to),
        metadata: await supabase
          .from('tournament_matches')
          .select('metadata')
          .eq('tournament_id', TOURNAMENT_ID)
          .eq('match_number', link.match)
          .single()
          .then(res => ({
            ...res.data?.metadata,
            advances_to: link.advances_to,
            advances_to_position: link.position
          }))
      })
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('match_number', link.match)
    
    if (error) {
      console.log(`   ❌ Error linking match #${link.match}: ${error.message}`)
      errorCount++
    } else {
      console.log(`   ✅ Match #${link.match} → Match #${link.advances_to} (${link.position})`)
      updateCount++
    }
  }
  
  // Update boys semi-finals
  console.log('\n📊 Linking Boys Semi-Finals to Final...')
  for (const link of progressionLinks.boys.semiFinals) {
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        advances_to_match_id: await getMatchId(link.advances_to),
        metadata: await supabase
          .from('tournament_matches')
          .select('metadata')
          .eq('tournament_id', TOURNAMENT_ID)
          .eq('match_number', link.match)
          .single()
          .then(res => ({
            ...res.data?.metadata,
            advances_to: link.advances_to,
            advances_to_position: link.position
          }))
      })
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('match_number', link.match)
    
    if (error) {
      console.log(`   ❌ Error linking match #${link.match}: ${error.message}`)
      errorCount++
    } else {
      console.log(`   ✅ Match #${link.match} → Match #${link.advances_to} (${link.position})`)
      updateCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('PROGRESSION SETUP SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully linked: ${updateCount} matches`)
  console.log(`❌ Errors encountered: ${errorCount} matches`)
}

// Helper function to get match ID from match number
async function getMatchId(matchNumber) {
  const { data } = await supabase
    .from('tournament_matches')
    .select('id')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('match_number', matchNumber)
    .single()
  
  return data?.id || null
}

// Run the setup
setupProgression()
  .then(() => {
    console.log('\n🎉 Tournament progression links set up successfully!')
    console.log('Now run the auto-progression script to populate winners.')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })