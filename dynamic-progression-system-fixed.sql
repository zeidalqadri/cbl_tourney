-- =====================================================
-- DYNAMIC TOURNAMENT PROGRESSION SYSTEM (FIXED)
-- =====================================================
-- This system automatically advances teams through tournament rounds
-- Works with any knockout tournament format

-- 1. Drop existing objects if they exist
DROP VIEW IF EXISTS tournament_progression CASCADE;
DROP TABLE IF EXISTS match_progressions CASCADE;
DROP FUNCTION IF EXISTS advance_team_to_next_round() CASCADE;
DROP FUNCTION IF EXISTS process_all_completed_matches() CASCADE;

-- 2. Create progression rules table
CREATE TABLE match_progressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_match INTEGER NOT NULL,
    target_match INTEGER NOT NULL,
    source_position TEXT NOT NULL CHECK (source_position IN ('winner', 'loser', 'team1', 'team2')),
    target_position TEXT NOT NULL CHECK (target_position IN ('team1', 'team2')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(source_match, source_position)
);

-- 3. Insert progression rules for current tournament
INSERT INTO match_progressions (source_match, target_match, source_position, target_position, description) VALUES
-- Boys Quarter-Finals to Semi-Finals (Winners advance)
(137, 145, 'winner', 'team1', 'Boys QF1 winner to SF1 team1'),
(138, 145, 'winner', 'team2', 'Boys QF2 winner to SF1 team2'),
(139, 146, 'winner', 'team1', 'Boys QF3 winner to SF2 team1'),
(140, 146, 'winner', 'team2', 'Boys QF4 winner to SF2 team2'),
(141, 147, 'winner', 'team1', 'Boys QF5 winner to SF3 team1'),
(142, 147, 'winner', 'team2', 'Boys QF6 winner to SF3 team2'),
(143, 148, 'winner', 'team1', 'Boys QF7 winner to SF4 team1'),
(144, 148, 'winner', 'team2', 'Boys QF8 winner to SF4 team2'),

-- Boys Semi-Finals to Finals
(145, 149, 'loser', 'team1', 'Boys SF1 loser to 3rd place team1'),
(146, 149, 'loser', 'team2', 'Boys SF2 loser to 3rd place team2'),
(147, 150, 'winner', 'team1', 'Boys SF3 winner to Final team1'),
(148, 150, 'winner', 'team2', 'Boys SF4 winner to Final team2'),

-- Girls Quarter-Finals to Semi-Finals (Winners advance)
(237, 245, 'winner', 'team1', 'Girls QF1 winner to SF1 team1'),
(238, 245, 'winner', 'team2', 'Girls QF2 winner to SF1 team2'),
(239, 246, 'winner', 'team1', 'Girls QF3 winner to SF2 team1'),
(240, 246, 'winner', 'team2', 'Girls QF4 winner to SF2 team2'),
(241, 247, 'winner', 'team1', 'Girls QF5 winner to SF3 team1'),
(242, 247, 'winner', 'team2', 'Girls QF6 winner to SF3 team2'),
(243, 248, 'winner', 'team1', 'Girls QF7 winner to SF4 team1'),
(244, 248, 'winner', 'team2', 'Girls QF8 winner to SF4 team2'),

-- Girls Semi-Finals to Finals
(245, 249, 'loser', 'team1', 'Girls SF1 loser to 3rd place team1'),
(246, 249, 'loser', 'team2', 'Girls SF2 loser to 3rd place team2'),
(247, 250, 'winner', 'team1', 'Girls SF3 winner to Final team1'),
(248, 250, 'winner', 'team2', 'Girls SF4 winner to Final team2');

-- 4. Create function to advance teams
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
    
    -- Determine winner and loser
    IF NEW.team1_score IS NULL OR NEW.team2_score IS NULL THEN
        RAISE NOTICE 'Match % completed but no scores recorded', NEW.match_number;
        RETURN NEW;
    END IF;
    
    IF NEW.team1_score > NEW.team2_score THEN
        v_winner_id := NEW.team1_id;
        v_loser_id := NEW.team2_id;
    ELSIF NEW.team2_score > NEW.team1_score THEN
        v_winner_id := NEW.team2_id;
        v_loser_id := NEW.team1_id;
    ELSE
        RAISE NOTICE 'Match % ended in a tie - no progression', NEW.match_number;
        RETURN NEW;
    END IF;
    
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
        
        -- Update target match
        IF v_progression.target_position = 'team1' THEN
            UPDATE matches 
            SET team1_id = v_advancing_team
            WHERE match_number = v_progression.target_match;
            
            RAISE NOTICE 'Advanced team % to match % as team1 (%)', 
                v_advancing_team, v_progression.target_match, v_progression.description;
        ELSE
            UPDATE matches 
            SET team2_id = v_advancing_team
            WHERE match_number = v_progression.target_match;
            
            RAISE NOTICE 'Advanced team % to match % as team2 (%)', 
                v_advancing_team, v_progression.target_match, v_progression.description;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger
DROP TRIGGER IF EXISTS trigger_auto_progression ON matches;
CREATE TRIGGER trigger_auto_progression
    AFTER UPDATE OF status ON matches
    FOR EACH ROW
    EXECUTE FUNCTION advance_team_to_next_round();

-- 6. Function to manually process all completed matches
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
        SELECT * FROM matches 
        WHERE status = 'completed'
        AND match_number IN (SELECT DISTINCT source_match FROM match_progressions)
        ORDER BY match_number
    LOOP
        -- Determine winner and loser
        IF v_match.team1_score IS NULL OR v_match.team2_score IS NULL THEN
            CONTINUE;
        END IF;
        
        IF v_match.team1_score > v_match.team2_score THEN
            v_winner_id := v_match.team1_id;
            v_loser_id := v_match.team2_id;
        ELSIF v_match.team2_score > v_match.team1_score THEN
            v_winner_id := v_match.team2_id;
            v_loser_id := v_match.team1_id;
        ELSE
            CONTINUE; -- Skip ties
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
                UPDATE matches 
                SET team1_id = v_advancing_team
                WHERE match_number = v_progression.target_match
                AND (team1_id IS NULL OR team1_id != v_advancing_team);
            ELSE
                UPDATE matches 
                SET team2_id = v_advancing_team
                WHERE match_number = v_progression.target_match
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

-- 7. Create view to see progression status
CREATE VIEW tournament_progression AS
SELECT 
    m.match_number,
    m.round,
    CASE 
        WHEN m.match_number BETWEEN 137 AND 144 THEN 'Boys Quarter-Final'
        WHEN m.match_number BETWEEN 145 AND 148 THEN 'Boys Semi-Final'
        WHEN m.match_number = 149 THEN 'Boys 3rd Place'
        WHEN m.match_number = 150 THEN 'Boys Final'
        WHEN m.match_number BETWEEN 237 AND 244 THEN 'Girls Quarter-Final'
        WHEN m.match_number BETWEEN 245 AND 248 THEN 'Girls Semi-Final'
        WHEN m.match_number = 249 THEN 'Girls 3rd Place'
        WHEN m.match_number = 250 THEN 'Girls Final'
        ELSE 'Group Stage'
    END as stage,
    t1.name as team1_name,
    t2.name as team2_name,
    m.team1_score,
    m.team2_score,
    m.status,
    mp.target_match as advances_to,
    mp.description as progression_rule
FROM matches m
LEFT JOIN teams t1 ON m.team1_id = t1.id
LEFT JOIN teams t2 ON m.team2_id = t2.id
LEFT JOIN match_progressions mp ON m.match_number = mp.source_match AND mp.source_position = 'winner'
WHERE m.match_number >= 137
ORDER BY m.match_number;

-- 8. Execute initial progression processing
DO $$
BEGIN
    RAISE NOTICE 'Processing all completed matches for progression...';
END $$;

SELECT * FROM process_all_completed_matches();

-- 9. Show current knockout stage status
SELECT 
    match_number,
    stage,
    COALESCE(team1_name, 'TBD') as team1,
    COALESCE(team2_name, 'TBD') as team2,
    CASE 
        WHEN status = 'completed' THEN team1_score || '-' || team2_score
        ELSE status
    END as score_or_status
FROM tournament_progression 
WHERE match_number IN (
    -- Boys knockouts
    145,146,147,148,149,150,
    -- Girls knockouts  
    245,246,247,248,249,250
)
ORDER BY match_number;

-- 10. Summary of what needs to be completed for progressions
SELECT 
    'Pending Quarter-Finals' as category,
    COUNT(*) as count
FROM matches 
WHERE match_number IN (137,138,139,140,141,142,143,144,237,238,239,240,241,242,243,244)
AND status != 'completed'

UNION ALL

SELECT 
    'Semi-Finals Missing Teams' as category,
    COUNT(*) as count
FROM matches 
WHERE match_number IN (145,146,147,148,245,246,247,248)
AND (team1_id IS NULL OR team2_id IS NULL);