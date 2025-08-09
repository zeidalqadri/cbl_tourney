import { supabase } from './supabase'

// Safe score update that works around the trigger issue
export async function updateMatchScoreSafe(
  matchId: string, 
  scoreA: number, 
  scoreB: number
) {
  // First, get the match to find team IDs
  const { data: match, error: fetchError } = await supabase
    .from('tournament_matches')
    .select('team1_id, team2_id, metadata, match_number')
    .eq('id', matchId)
    .single()
  
  if (fetchError) {
    throw new Error(`Failed to fetch match: ${fetchError.message}`)
  }
  
  // Determine winner
  let winnerId = null
  if (match?.team1_id && match?.team2_id) {
    if (scoreA > scoreB) {
      winnerId = match.team1_id
    } else if (scoreB > scoreA) {
      winnerId = match.team2_id
    }
  }
  
  // Try to update using raw SQL to bypass triggers
  try {
    // Use a direct SQL approach through a stored procedure if available
    const { error: updateError } = await supabase.rpc('update_match_score_direct', {
      p_match_id: matchId,
      p_score1: scoreA,
      p_score2: scoreB,
      p_winner_id: winnerId
    })
    
    if (updateError) {
      // Fallback to regular update if RPC doesn't exist
      console.log('RPC not available, trying regular update...')
      throw updateError
    }
    
    console.log('✅ Score updated successfully via RPC')
    return { success: true }
  } catch (rpcError) {
    // If RPC fails, try the regular update with better error handling
    const updates: any = {
      score1: scoreA,
      score2: scoreB,
      status: 'completed',
      updated_at: new Date().toISOString()
    }
    
    // Only add winner_id if we have one
    if (winnerId) {
      updates.winner_id = winnerId
    }
    
    const { error } = await supabase
      .from('tournament_matches')
      .update(updates)
      .eq('id', matchId)
    
    if (error) {
      console.error('❌ Score update failed:', {
        matchId,
        matchNumber: match.match_number,
        updates,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // If it's the UUID type error, provide a more helpful message
      if (error.code === '42804' && error.message.includes('uuid but expression is of type text')) {
        throw new Error(
          `Database trigger error: There's a faulty trigger in the database trying to update team IDs incorrectly. ` +
          `Please contact the database administrator to fix or disable the 'trigger_auto_progression' trigger. ` +
          `Match #${match.match_number} scores: ${scoreA}-${scoreB}`
        )
      }
      
      throw new Error(`Failed to update score: ${error.message}. ${error.hint || ''}`)
    }
    
    console.log('✅ Score updated successfully')
    return { success: true }
  }
}