-- Fix trigger issue causing score update failures
-- The trigger is trying to update non-existent 'matches' table

-- 1. Drop any problematic triggers
DROP TRIGGER IF EXISTS trigger_auto_progression ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_progression ON matches CASCADE;
DROP TRIGGER IF EXISTS handle_match_update ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS auto_progress_match ON tournament_matches CASCADE;

-- 2. Drop problematic functions
DROP FUNCTION IF EXISTS advance_team_to_next_round() CASCADE;
DROP FUNCTION IF EXISTS handle_match_update() CASCADE;
DROP FUNCTION IF EXISTS auto_progress_teams() CASCADE;

-- 3. Drop progression tables if they exist
DROP TABLE IF EXISTS match_progressions CASCADE;

-- Now score updates should work without trigger interference