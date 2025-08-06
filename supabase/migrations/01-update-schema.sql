-- Migration: Update schema for better tournament tracking
-- Date: 2025-08-06
-- Purpose: Add missing columns and improve data structure for MSSN Melaka Basketball Championship 2025

-- Add missing columns to tournament_teams table for better statistics tracking
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_position INTEGER;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_points INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_wins INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_losses INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_played INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS points_for INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS points_against INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS points_difference INTEGER GENERATED ALWAYS AS (points_for - points_against) STORED;

-- Add columns to better track match details
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS group_code VARCHAR(10);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS match_date DATE;
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS match_time TIME;
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS venue_court VARCHAR(50);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tournament_matches_group ON tournament_matches(tournament_id, group_code);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_date ON tournament_matches(tournament_id, match_date);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_pool ON tournament_teams(tournament_id, pool, division);

-- Add stage tracking enum type if not exists
DO $$ BEGIN
    CREATE TYPE tournament_stage AS ENUM ('group_stage', 'second_round', 'quarter_final', 'semi_final', 'final');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update qualification status enum to include more states
DO $$ BEGIN
    ALTER TYPE qualification_status ADD VALUE IF NOT EXISTS 'group_winner';
    ALTER TYPE qualification_status ADD VALUE IF NOT EXISTS 'second_round_qualified';
EXCEPTION
    WHEN others THEN null;
END $$;

-- Create a view for easy group standings calculation
CREATE OR REPLACE VIEW tournament_group_standings AS
WITH match_results AS (
    SELECT 
        t.tournament_id,
        t.id as team_id,
        t.team_name,
        t.pool as group_code,
        t.division,
        m.id as match_id,
        CASE 
            WHEN m.team1_id = t.id AND m.score1 > m.score2 THEN 1
            WHEN m.team2_id = t.id AND m.score2 > m.score1 THEN 1
            ELSE 0
        END as won,
        CASE 
            WHEN m.team1_id = t.id AND m.score1 < m.score2 THEN 1
            WHEN m.team2_id = t.id AND m.score2 < m.score1 THEN 1
            ELSE 0
        END as lost,
        CASE 
            WHEN m.team1_id = t.id THEN m.score1
            WHEN m.team2_id = t.id THEN m.score2
            ELSE 0
        END as points_for,
        CASE 
            WHEN m.team1_id = t.id THEN m.score2
            WHEN m.team2_id = t.id THEN m.score1
            ELSE 0
        END as points_against
    FROM tournament_teams t
    LEFT JOIN tournament_matches m 
        ON (m.team1_id = t.id OR m.team2_id = t.id) 
        AND m.tournament_id = t.tournament_id
        AND m.status = 'completed'
)
SELECT 
    tournament_id,
    team_id,
    team_name,
    group_code,
    division,
    COUNT(match_id) as played,
    SUM(won) as wins,
    SUM(lost) as losses,
    SUM(won) * 2 as points,
    SUM(points_for) as points_for,
    SUM(points_against) as points_against,
    SUM(points_for) - SUM(points_against) as points_diff,
    RANK() OVER (
        PARTITION BY tournament_id, group_code, division 
        ORDER BY SUM(won) * 2 DESC, SUM(points_for) - SUM(points_against) DESC
    ) as position
FROM match_results
GROUP BY tournament_id, team_id, team_name, group_code, division
ORDER BY group_code, position;

-- Function to update team statistics after match completion
CREATE OR REPLACE FUNCTION update_team_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if match status changed to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update team1 statistics
        UPDATE tournament_teams 
        SET 
            group_wins = group_wins + CASE WHEN NEW.score1 > NEW.score2 THEN 1 ELSE 0 END,
            group_losses = group_losses + CASE WHEN NEW.score1 < NEW.score2 THEN 1 ELSE 0 END,
            group_played = group_played + 1,
            group_points = (group_wins + CASE WHEN NEW.score1 > NEW.score2 THEN 1 ELSE 0 END) * 2,
            points_for = points_for + NEW.score1,
            points_against = points_against + NEW.score2
        WHERE id = NEW.team1_id;
        
        -- Update team2 statistics
        UPDATE tournament_teams 
        SET 
            group_wins = group_wins + CASE WHEN NEW.score2 > NEW.score1 THEN 1 ELSE 0 END,
            group_losses = group_losses + CASE WHEN NEW.score2 < NEW.score1 THEN 1 ELSE 0 END,
            group_played = group_played + 1,
            group_points = (group_wins + CASE WHEN NEW.score2 > NEW.score1 THEN 1 ELSE 0 END) * 2,
            points_for = points_for + NEW.score2,
            points_against = points_against + NEW.score1
        WHERE id = NEW.team2_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic statistics update
DROP TRIGGER IF EXISTS update_team_stats_on_match_complete ON tournament_matches;
CREATE TRIGGER update_team_stats_on_match_complete
    AFTER UPDATE OF status, score1, score2 ON tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_team_statistics();

-- Add comment for documentation
COMMENT ON TABLE tournament_teams IS 'Teams participating in MSSN Melaka Basketball Championship 2025';
COMMENT ON TABLE tournament_matches IS 'All matches including group stage and knockout rounds';
COMMENT ON VIEW tournament_group_standings IS 'Real-time group standings calculated from match results';