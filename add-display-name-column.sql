-- Add display_name column to tournament_teams table
ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS display_name TEXT;