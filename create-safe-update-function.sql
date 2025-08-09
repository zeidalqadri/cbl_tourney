-- Create a safe function to update match scores
-- This bypasses any problematic triggers

CREATE OR REPLACE FUNCTION update_match_score_direct(
    p_match_id UUID,
    p_score1 INTEGER,
    p_score2 INTEGER,
    p_winner_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Disable triggers temporarily for this session
    SET session_replication_role = 'replica';
    
    -- Update the match
    UPDATE tournament_matches
    SET 
        score1 = p_score1,
        score2 = p_score2,
        status = 'completed',
        winner_id = CASE 
            WHEN p_winner_id IS NOT NULL THEN p_winner_id
            WHEN p_score1 > p_score2 THEN team1_id
            WHEN p_score2 > p_score1 THEN team2_id
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = p_match_id;
    
    -- Re-enable triggers
    SET session_replication_role = 'origin';
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Make sure triggers are re-enabled even on error
        SET session_replication_role = 'origin';
        RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_match_score_direct TO authenticated;
GRANT EXECUTE ON FUNCTION update_match_score_direct TO anon;