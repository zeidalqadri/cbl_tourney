-- Add missing columns for tournament standings calculation
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_position INTEGER;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_points INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_wins INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_losses INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_played INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS points_for INTEGER DEFAULT 0;
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS points_against INTEGER DEFAULT 0;