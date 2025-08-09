#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

const { data: matches } = await supabase
  .from('tournament_matches')
  .select('match_number, metadata, advances_to_match_id, team1:tournament_teams!tournament_matches_team1_id_fkey(team_name, division), team2:tournament_teams!tournament_matches_team2_id_fkey(team_name, division)')
  .eq('tournament_id', TOURNAMENT_ID)
  .gte('match_number', 103)
  .lte('match_number', 122)
  .order('match_number')

console.log('Boys Match Metadata Check:')
console.log('='.repeat(50))

matches?.forEach(match => {
  const isBoys = match.team1?.division === 'boys' || match.team2?.division === 'boys'
  if (!isBoys) return
  
  const hasGroup = match.metadata?.group
  const hasAdvancement = match.advances_to_match_id
  const status = hasGroup && hasAdvancement ? '✅' : '❌'
  
  console.log(`Match #${match.match_number}: ${status} Group: ${match.metadata?.group || 'None'} Advancement: ${hasAdvancement ? 'Yes' : 'No'}`)
})