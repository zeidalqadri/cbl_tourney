-- Create function to automatically advance winners to next round
CREATE OR REPLACE FUNCTION auto_advance_winner()
RETURNS TRIGGER AS $$
DECLARE
    winner_team_id UUID;
    next_match_number INT;
    next_position TEXT;
BEGIN
    -- Only process if match status changed to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Determine the winner
        IF NEW.home_score > NEW.away_score THEN
            winner_team_id := NEW.home_team_id;
        ELSIF NEW.away_score > NEW.home_score THEN
            winner_team_id := NEW.away_team_id;
        ELSE
            -- It's a tie, don't advance anyone
            RETURN NEW;
        END IF;

        -- Determine next match based on current match number
        -- Boys Quarter-Finals to Semi-Finals
        IF NEW.match_number = 137 THEN
            next_match_number := 145; next_position := 'home';
        ELSIF NEW.match_number = 138 THEN
            next_match_number := 145; next_position := 'away';
        ELSIF NEW.match_number = 139 THEN
            next_match_number := 146; next_position := 'home';
        ELSIF NEW.match_number = 140 THEN
            next_match_number := 146; next_position := 'away';
        ELSIF NEW.match_number = 141 THEN
            next_match_number := 147; next_position := 'home';
        ELSIF NEW.match_number = 142 THEN
            next_match_number := 147; next_position := 'away';
        ELSIF NEW.match_number = 143 THEN
            next_match_number := 148; next_position := 'home';
        ELSIF NEW.match_number = 144 THEN
            next_match_number := 148; next_position := 'away';
        
        -- Boys Semi-Finals to Finals
        ELSIF NEW.match_number = 145 THEN
            next_match_number := 149; next_position := 'home';
        ELSIF NEW.match_number = 146 THEN
            next_match_number := 149; next_position := 'away';
        ELSIF NEW.match_number = 147 THEN
            next_match_number := 150; next_position := 'home';
        ELSIF NEW.match_number = 148 THEN
            next_match_number := 150; next_position := 'away';
        
        -- Girls Quarter-Finals to Semi-Finals
        ELSIF NEW.match_number = 237 THEN
            next_match_number := 245; next_position := 'home';
        ELSIF NEW.match_number = 238 THEN
            next_match_number := 245; next_position := 'away';
        ELSIF NEW.match_number = 239 THEN
            next_match_number := 246; next_position := 'home';
        ELSIF NEW.match_number = 240 THEN
            next_match_number := 246; next_position := 'away';
        ELSIF NEW.match_number = 241 THEN
            next_match_number := 247; next_position := 'home';
        ELSIF NEW.match_number = 242 THEN
            next_match_number := 247; next_position := 'away';
        ELSIF NEW.match_number = 243 THEN
            next_match_number := 248; next_position := 'home';
        ELSIF NEW.match_number = 244 THEN
            next_match_number := 248; next_position := 'away';
        
        -- Girls Semi-Finals to Finals
        ELSIF NEW.match_number = 245 THEN
            next_match_number := 249; next_position := 'home';
        ELSIF NEW.match_number = 246 THEN
            next_match_number := 249; next_position := 'away';
        ELSIF NEW.match_number = 247 THEN
            next_match_number := 250; next_position := 'home';
        ELSIF NEW.match_number = 248 THEN
            next_match_number := 250; next_position := 'away';
        ELSE
            -- No progression for this match
            RETURN NEW;
        END IF;

        -- Update the next match with the winner
        IF next_position = 'home' THEN
            UPDATE matches 
            SET home_team_id = winner_team_id 
            WHERE match_number = next_match_number;
        ELSE
            UPDATE matches 
            SET away_team_id = winner_team_id 
            WHERE match_number = next_match_number;
        END IF;

        RAISE NOTICE 'Advanced winner of match % to match % as %', NEW.match_number, next_match_number, next_position;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-advance winners
DROP TRIGGER IF EXISTS trigger_auto_advance_winner ON matches;
CREATE TRIGGER trigger_auto_advance_winner
    AFTER UPDATE OF status, home_score, away_score
    ON matches
    FOR EACH ROW
    EXECUTE FUNCTION auto_advance_winner();

-- Function to manually fix any missing progressions
CREATE OR REPLACE FUNCTION fix_missing_progressions()
RETURNS TABLE(
    source_match INT,
    target_match INT,
    position TEXT,
    winner_team_id UUID,
    status TEXT
) AS $$
DECLARE
    rec RECORD;
    winner_id UUID;
    target_match_num INT;
    target_pos TEXT;
    update_status TEXT;
BEGIN
    -- Process all completed matches that should have progressions
    FOR rec IN 
        SELECT * FROM matches 
        WHERE status = 'completed' 
        AND match_number IN (
            137,138,139,140,141,142,143,144,145,146,147,148,
            237,238,239,240,241,242,243,244,245,246,247,248
        )
        ORDER BY match_number
    LOOP
        -- Determine winner
        IF rec.home_score > rec.away_score THEN
            winner_id := rec.home_team_id;
        ELSIF rec.away_score > rec.home_score THEN
            winner_id := rec.away_team_id;
        ELSE
            CONTINUE; -- Skip ties
        END IF;

        -- Determine target match and position
        CASE rec.match_number
            -- Boys QF to SF
            WHEN 137 THEN target_match_num := 145; target_pos := 'home';
            WHEN 138 THEN target_match_num := 145; target_pos := 'away';
            WHEN 139 THEN target_match_num := 146; target_pos := 'home';
            WHEN 140 THEN target_match_num := 146; target_pos := 'away';
            WHEN 141 THEN target_match_num := 147; target_pos := 'home';
            WHEN 142 THEN target_match_num := 147; target_pos := 'away';
            WHEN 143 THEN target_match_num := 148; target_pos := 'home';
            WHEN 144 THEN target_match_num := 148; target_pos := 'away';
            -- Boys SF to Finals
            WHEN 145 THEN target_match_num := 149; target_pos := 'home';
            WHEN 146 THEN target_match_num := 149; target_pos := 'away';
            WHEN 147 THEN target_match_num := 150; target_pos := 'home';
            WHEN 148 THEN target_match_num := 150; target_pos := 'away';
            -- Girls QF to SF
            WHEN 237 THEN target_match_num := 245; target_pos := 'home';
            WHEN 238 THEN target_match_num := 245; target_pos := 'away';
            WHEN 239 THEN target_match_num := 246; target_pos := 'home';
            WHEN 240 THEN target_match_num := 246; target_pos := 'away';
            WHEN 241 THEN target_match_num := 247; target_pos := 'home';
            WHEN 242 THEN target_match_num := 247; target_pos := 'away';
            WHEN 243 THEN target_match_num := 248; target_pos := 'home';
            WHEN 244 THEN target_match_num := 248; target_pos := 'away';
            -- Girls SF to Finals
            WHEN 245 THEN target_match_num := 249; target_pos := 'home';
            WHEN 246 THEN target_match_num := 249; target_pos := 'away';
            WHEN 247 THEN target_match_num := 250; target_pos := 'home';
            WHEN 248 THEN target_match_num := 250; target_pos := 'away';
            ELSE CONTINUE;
        END CASE;

        -- Update target match
        IF target_pos = 'home' THEN
            UPDATE matches 
            SET home_team_id = winner_id 
            WHERE match_number = target_match_num
            AND (home_team_id IS NULL OR home_team_id != winner_id);
            
            IF FOUND THEN
                update_status := 'Updated';
            ELSE
                update_status := 'Already Set';
            END IF;
        ELSE
            UPDATE matches 
            SET away_team_id = winner_id 
            WHERE match_number = target_match_num
            AND (away_team_id IS NULL OR away_team_id != winner_id);
            
            IF FOUND THEN
                update_status := 'Updated';
            ELSE
                update_status := 'Already Set';
            END IF;
        END IF;

        RETURN QUERY 
        SELECT 
            rec.match_number,
            target_match_num,
            target_pos,
            winner_id,
            update_status;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the fix function to populate any missing progressions
SELECT * FROM fix_missing_progressions();