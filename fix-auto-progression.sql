-- =====================================================
-- FIX TOURNAMENT AUTO-PROGRESSION SYSTEM
-- =====================================================
-- This fixes the table name mismatch issue where triggers were on 'matches'
-- but the app uses 'tournament_matches' table

-- 1. Drop existing incorrect objects if they exist
DROP VIEW IF EXISTS tournament_progression CASCADE;
DROP TABLE IF EXISTS match_progressions CASCADE;
DROP FUNCTION IF EXISTS advance_team_to_next_round() CASCADE;
DROP FUNCTION IF EXISTS process_all_completed_matches() CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_progression ON matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_progression ON tournament_matches CASCADE;

-- 2. Create progression rules table
CREATE TABLE IF NOT EXISTS match_progressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_match INTEGER NOT NULL,
    target_match INTEGER NOT NULL,
    source_position TEXT NOT NULL CHECK (source_position IN ('winner', 'loser', 'team1', 'team2')),
    target_position TEXT NOT NULL CHECK (target_position IN ('team1', 'team2')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(source_match, source_position)
);

-- 3. Clear and insert progression rules
DELETE FROM match_progressions;

-- Boys knockout progression rules  
INSERT INTO match_progressions (source_match, target_match, source_position, target_position, description) VALUES
-- Boys Semi-Finals (124-127 advance to 128-129)
(124, 128, 'winner', 'team1', 'Boys SF1 winner to Final team1'),
(125, 128, 'winner', 'team2', 'Boys SF2 winner to Final team2'),
(126, 129, 'winner', 'team1', 'Boys SF3 winner to Final team1'),
(127, 129, 'winner', 'team2', 'Boys SF4 winner to Final team2'),

-- Girls Semi-Finals progression
-- Add more rules as needed based on actual match numbers
;

-- 4. Create function to advance teams (FIXED for tournament_matches table)
CREATE OR REPLACE FUNCTION advance_team_to_next_round()
RETURNS TRIGGER AS $$
DECLARE
    v_winner_id TEXT;
    v_loser_id TEXT;
    v_progression RECORD;
    v_advancing_team TEXT;
BEGIN
    -- Only process when match is completed
    IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
        RETURN NEW;
    END IF;
    
    -- Determine winner and loser (using correct column names: score1/score2)
    IF NEW.score1 IS NULL OR NEW.score2 IS NULL THEN
        RAISE NOTICE 'Match % completed but no scores recorded', NEW.match_number;
        RETURN NEW;
    END IF;
    
    IF NEW.score1 > NEW.score2 THEN
        v_winner_id := NEW.team1_id;
        v_loser_id := NEW.team2_id;
    ELSIF NEW.score2 > NEW.score1 THEN
        v_winner_id := NEW.team2_id;
        v_loser_id := NEW.team1_id;
    ELSE
        RAISE NOTICE 'Match % ended in a tie - no progression', NEW.match_number;
        RETURN NEW;
    END IF;
    
    -- Update winner_id column
    NEW.winner_id := v_winner_id;
    
    -- Find all progression rules for this match
    FOR v_progression IN 
        SELECT * FROM match_progressions 
        WHERE source_match = NEW.match_number
    LOOP
        -- Determine which team advances
        CASE v_progression.source_position
            WHEN 'winner' THEN v_advancing_team := v_winner_id;
            WHEN 'loser' THEN v_advancing_team := v_loser_id;
            WHEN 'team1' THEN v_advancing_team := NEW.team1_id;
            WHEN 'team2' THEN v_advancing_team := NEW.team2_id;
        END CASE;
        
        -- Update target match in tournament_matches table
        IF v_progression.target_position = 'team1' THEN
            UPDATE tournament_matches 
            SET team1_id = v_advancing_team
            WHERE match_number = v_progression.target_match
            AND tournament_id = NEW.tournament_id;
            
            RAISE NOTICE 'Advanced team % to match % as team1 (%)', 
                v_advancing_team, v_progression.target_match, v_progression.description;
        ELSE
            UPDATE tournament_matches 
            SET team2_id = v_advancing_team
            WHERE match_number = v_progression.target_match
            AND tournament_id = NEW.tournament_id;
            
            RAISE NOTICE 'Advanced team % to match % as team2 (%)', 
                v_advancing_team, v_progression.target_match, v_progression.description;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger on the CORRECT table (tournament_matches)
DROP TRIGGER IF EXISTS trigger_auto_progression ON tournament_matches;
CREATE TRIGGER trigger_auto_progression
    BEFORE UPDATE OF status ON tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION advance_team_to_next_round();

-- 6. Manual progression function for processing completed matches
CREATE OR REPLACE FUNCTION process_all_completed_matches()
RETURNS TABLE(
    match_processed INTEGER,
    teams_advanced INTEGER,
    description TEXT
) AS $$
DECLARE
    v_match RECORD;
    v_winner_id TEXT;
    v_loser_id TEXT;
    v_progression RECORD;
    v_advancing_team TEXT;
    v_count INTEGER := 0;
BEGIN
    FOR v_match IN 
        SELECT * FROM tournament_matches 
        WHERE status = 'completed'
        AND tournament_id = '66666666-6666-6666-6666-666666666666'
        AND match_number IN (SELECT DISTINCT source_match FROM match_progressions)
        ORDER BY match_number
    LOOP
        -- Determine winner and loser
        IF v_match.score1 IS NULL OR v_match.score2 IS NULL THEN
            CONTINUE;
        END IF;
        
        IF v_match.score1 > v_match.score2 THEN
            v_winner_id := v_match.team1_id;
            v_loser_id := v_match.team2_id;
        ELSIF v_match.score2 > v_match.score1 THEN
            v_winner_id := v_match.team2_id;
            v_loser_id := v_match.team1_id;
        ELSE
            CONTINUE; -- Skip ties
        END IF;
        
        -- Update winner_id if not set
        IF v_match.winner_id IS NULL OR v_match.winner_id != v_winner_id THEN
            UPDATE tournament_matches 
            SET winner_id = v_winner_id
            WHERE id = v_match.id;
        END IF;
        
        -- Process progressions
        FOR v_progression IN 
            SELECT * FROM match_progressions 
            WHERE source_match = v_match.match_number
        LOOP
            CASE v_progression.source_position
                WHEN 'winner' THEN v_advancing_team := v_winner_id;
                WHEN 'loser' THEN v_advancing_team := v_loser_id;
                WHEN 'team1' THEN v_advancing_team := v_match.team1_id;
                WHEN 'team2' THEN v_advancing_team := v_match.team2_id;
            END CASE;
            
            IF v_progression.target_position = 'team1' THEN
                UPDATE tournament_matches 
                SET team1_id = v_advancing_team
                WHERE match_number = v_progression.target_match
                AND tournament_id = v_match.tournament_id
                AND (team1_id IS NULL OR team1_id != v_advancing_team);
            ELSE
                UPDATE tournament_matches 
                SET team2_id = v_advancing_team
                WHERE match_number = v_progression.target_match
                AND tournament_id = v_match.tournament_id
                AND (team2_id IS NULL OR team2_id != v_advancing_team);
            END IF;
            
            v_count := v_count + 1;
            
            RETURN QUERY 
            SELECT 
                v_match.match_number,
                v_progression.target_match,
                v_progression.description;
        END LOOP;
    END LOOP;
    
    IF v_count = 0 THEN
        RETURN QUERY SELECT 0, 0, 'No progressions needed'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Process any existing completed matches
SELECT * FROM process_all_completed_matches();

-- 8. Show current status
SELECT 
    match_number,
    COALESCE(t1.team_name, 'TBD') as team1,
    COALESCE(t2.team_name, 'TBD') as team2,
    score1,
    score2,
    status,
    winner_id
FROM tournament_matches m
LEFT JOIN tournament_teams t1 ON m.team1_id = t1.id
LEFT JOIN tournament_teams t2 ON m.team2_id = t2.id
WHERE m.tournament_id = '66666666-6666-6666-6666-666666666666'
AND m.match_number >= 124
ORDER BY m.match_number;