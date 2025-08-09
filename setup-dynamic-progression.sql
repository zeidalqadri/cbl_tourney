-- Dynamic Tournament Progression System
-- This creates a flexible progression system that works for any tournament format

-- First, let's add columns to track match relationships
ALTER TABLE matches ADD COLUMN IF NOT EXISTS advances_to_match INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS advances_to_position TEXT CHECK (advances_to_position IN ('home', 'away', 'team_a', 'team_b'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS progression_rule JSONB;

-- Create a progression mapping table for flexible tournament structures
CREATE TABLE IF NOT EXISTS match_progressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_match_number INTEGER NOT NULL,
    target_match_number INTEGER NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('home', 'away', 'team_a', 'team_b')),
    condition TEXT DEFAULT 'winner' CHECK (condition IN ('winner', 'loser', 'first', 'second')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(source_match_number, condition)
);

-- Insert progression rules for the current tournament
-- Boys Quarter-Finals to Semi-Finals
INSERT INTO match_progressions (source_match_number, target_match_number, position, condition) VALUES
(137, 145, 'home', 'winner'),
(138, 145, 'away', 'winner'),
(139, 146, 'home', 'winner'),
(140, 146, 'away', 'winner'),
(141, 147, 'home', 'winner'),
(142, 147, 'away', 'winner'),
(143, 148, 'home', 'winner'),
(144, 148, 'away', 'winner'),

-- Boys Semi-Finals to Finals
(145, 149, 'home', 'loser'),  -- 3rd place match gets losers
(146, 149, 'away', 'loser'),
(147, 150, 'home', 'winner'), -- Final gets winners
(148, 150, 'away', 'winner'),

-- Girls Quarter-Finals to Semi-Finals
(237, 245, 'home', 'winner'),
(238, 245, 'away', 'winner'),
(239, 246, 'home', 'winner'),
(240, 246, 'away', 'winner'),
(241, 247, 'home', 'winner'),
(242, 247, 'away', 'winner'),
(243, 248, 'home', 'winner'),
(244, 248, 'away', 'winner'),

-- Girls Semi-Finals to Finals
(245, 249, 'home', 'loser'),  -- 3rd place match gets losers
(246, 249, 'away', 'loser'),
(247, 250, 'home', 'winner'), -- Final gets winners
(248, 250, 'away', 'winner')
ON CONFLICT DO NOTHING;

-- Create the dynamic progression function
CREATE OR REPLACE FUNCTION advance_teams_dynamically()
RETURNS TRIGGER AS $$
DECLARE
    progression RECORD;
    advancing_team_id TEXT;
    winner_id TEXT;
    loser_id TEXT;
BEGIN
    -- Only process when match becomes completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Determine winner and loser
        IF NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
            IF NEW.home_score > NEW.away_score THEN
                winner_id := NEW.home_team_id;
                loser_id := NEW.away_team_id;
            ELSIF NEW.away_score > NEW.home_score THEN
                winner_id := NEW.away_team_id;
                loser_id := NEW.home_team_id;
            ELSE
                -- Handle tie (could implement overtime/penalty logic here)
                RETURN NEW;
            END IF;
        -- Also check for team_a/team_b columns
        ELSIF NEW.score_a IS NOT NULL AND NEW.score_b IS NOT NULL THEN
            IF NEW.score_a > NEW.score_b THEN
                winner_id := NEW.team_a_id;
                loser_id := NEW.team_b_id;
            ELSIF NEW.score_b > NEW.score_a THEN
                winner_id := NEW.team_b_id;
                loser_id := NEW.team_a_id;
            ELSE
                RETURN NEW;
            END IF;
        ELSE
            RETURN NEW;
        END IF;
        
        -- Find all progressions for this match
        FOR progression IN 
            SELECT * FROM match_progressions 
            WHERE source_match_number = NEW.match_number
        LOOP
            -- Determine which team advances based on condition
            IF progression.condition = 'winner' THEN
                advancing_team_id := winner_id;
            ELSIF progression.condition = 'loser' THEN
                advancing_team_id := loser_id;
            ELSE
                CONTINUE;
            END IF;
            
            -- Update the target match based on position
            IF progression.position IN ('home', 'team_a') THEN
                -- Try both column naming conventions
                UPDATE matches 
                SET home_team_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
                
                UPDATE matches 
                SET team_a_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
                
            ELSIF progression.position IN ('away', 'team_b') THEN
                UPDATE matches 
                SET away_team_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
                
                UPDATE matches 
                SET team_b_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
            END IF;
            
            RAISE NOTICE 'Advanced team % from match % to match % (position: %, condition: %)', 
                advancing_team_id, NEW.match_number, progression.target_match_number, 
                progression.position, progression.condition;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic progression
DROP TRIGGER IF EXISTS trigger_advance_teams ON matches;
CREATE TRIGGER trigger_advance_teams
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION advance_teams_dynamically();

-- Function to manually process all completed matches
CREATE OR REPLACE FUNCTION process_all_progressions()
RETURNS TABLE(
    source_match INTEGER,
    target_match INTEGER,
    team_advanced TEXT,
    position TEXT,
    status TEXT
) AS $$
DECLARE
    match_rec RECORD;
    progression RECORD;
    advancing_team_id TEXT;
    winner_id TEXT;
    loser_id TEXT;
    update_count INTEGER := 0;
BEGIN
    -- Process all completed matches
    FOR match_rec IN 
        SELECT * FROM matches 
        WHERE status = 'completed'
        AND match_number IN (SELECT DISTINCT source_match_number FROM match_progressions)
        ORDER BY match_number
    LOOP
        -- Determine winner and loser
        IF match_rec.home_score IS NOT NULL AND match_rec.away_score IS NOT NULL THEN
            IF match_rec.home_score > match_rec.away_score THEN
                winner_id := match_rec.home_team_id;
                loser_id := match_rec.away_team_id;
            ELSIF match_rec.away_score > match_rec.home_score THEN
                winner_id := match_rec.away_team_id;
                loser_id := match_rec.home_team_id;
            ELSE
                CONTINUE;
            END IF;
        ELSIF match_rec.score_a IS NOT NULL AND match_rec.score_b IS NOT NULL THEN
            IF match_rec.score_a > match_rec.score_b THEN
                winner_id := match_rec.team_a_id;
                loser_id := match_rec.team_b_id;
            ELSIF match_rec.score_b > match_rec.score_a THEN
                winner_id := match_rec.team_b_id;
                loser_id := match_rec.team_a_id;
            ELSE
                CONTINUE;
            END IF;
        ELSE
            CONTINUE;
        END IF;
        
        -- Process all progressions for this match
        FOR progression IN 
            SELECT * FROM match_progressions 
            WHERE source_match_number = match_rec.match_number
        LOOP
            IF progression.condition = 'winner' THEN
                advancing_team_id := winner_id;
            ELSIF progression.condition = 'loser' THEN
                advancing_team_id := loser_id;
            ELSE
                CONTINUE;
            END IF;
            
            -- Update target match
            IF progression.position IN ('home', 'team_a') THEN
                UPDATE matches SET home_team_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
                
                UPDATE matches SET team_a_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
            ELSE
                UPDATE matches SET away_team_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
                
                UPDATE matches SET team_b_id = advancing_team_id 
                WHERE match_number = progression.target_match_number;
            END IF;
            
            RETURN QUERY 
            SELECT 
                match_rec.match_number,
                progression.target_match_number,
                advancing_team_id,
                progression.position,
                'Updated'::TEXT;
                
            update_count := update_count + 1;
        END LOOP;
    END LOOP;
    
    IF update_count = 0 THEN
        RAISE NOTICE 'No progressions to process';
    ELSE
        RAISE NOTICE 'Processed % progressions', update_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- View to see progression status
CREATE OR REPLACE VIEW progression_status AS
WITH match_teams AS (
    SELECT 
        m.match_number,
        m.match_type,
        m.status,
        COALESCE(m.home_team_id, m.team_a_id) as team_1_id,
        COALESCE(m.away_team_id, m.team_b_id) as team_2_id,
        COALESCE(ht.name, t1.name) as team_1_name,
        COALESCE(at.name, t2.name) as team_2_name
    FROM matches m
    LEFT JOIN teams ht ON m.home_team_id = ht.id
    LEFT JOIN teams at ON m.away_team_id = at.id
    LEFT JOIN teams t1 ON m.team_a_id = t1.id
    LEFT JOIN teams t2 ON m.team_b_id = t2.id
)
SELECT 
    mt.match_number,
    mt.match_type,
    mt.status,
    mt.team_1_name,
    mt.team_2_name,
    mp.target_match_number as advances_to,
    mp.position as advances_to_position,
    mp.condition
FROM match_teams mt
LEFT JOIN match_progressions mp ON mt.match_number = mp.source_match_number
WHERE mt.match_number IN (
    SELECT source_match_number FROM match_progressions
    UNION
    SELECT target_match_number FROM match_progressions
)
ORDER BY mt.match_number;

-- Run the progression processor to fix any missing progressions
SELECT * FROM process_all_progressions();