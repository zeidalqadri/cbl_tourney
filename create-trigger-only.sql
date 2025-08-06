-- Create or replace the auto-progression function for tournament_matches
CREATE OR REPLACE FUNCTION advance_team_to_next_round()
RETURNS TRIGGER AS $$
DECLARE
    v_winner_id TEXT;
BEGIN
    -- Only process when match is completed
    IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
        RETURN NEW;
    END IF;
    
    -- Determine winner using correct column names (score1/score2)
    IF NEW.score1 IS NULL OR NEW.score2 IS NULL THEN
        RETURN NEW;
    END IF;
    
    IF NEW.score1 > NEW.score2 THEN
        v_winner_id := NEW.team1_id;
    ELSIF NEW.score2 > NEW.score1 THEN
        v_winner_id := NEW.team2_id;
    ELSE
        RETURN NEW; -- Tie
    END IF;
    
    -- Update winner_id
    NEW.winner_id := v_winner_id;
    
    -- If this match has advances_to_match_id, update the target match
    IF NEW.advances_to_match_id IS NOT NULL AND NEW.metadata->>'advances_to_position' IS NOT NULL THEN
        IF NEW.metadata->>'advances_to_position' = 'team1' THEN
            UPDATE tournament_matches 
            SET team1_id = v_winner_id
            WHERE id = NEW.advances_to_match_id;
        ELSE
            UPDATE tournament_matches 
            SET team2_id = v_winner_id
            WHERE id = NEW.advances_to_match_id;
        END IF;
        
        RAISE NOTICE 'Advanced winner % to next match', v_winner_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on tournament_matches table
DROP TRIGGER IF EXISTS trigger_auto_progression ON tournament_matches;
CREATE TRIGGER trigger_auto_progression
    BEFORE UPDATE OF status ON tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION advance_team_to_next_round();

-- Test by checking current trigger status
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger 
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname = 'trigger_auto_progression';