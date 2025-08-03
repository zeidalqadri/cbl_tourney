-- Add missing columns to existing tables for MSS Melaka 2025 Tournament

-- Add qualification tracking columns to tournament_teams
ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS qualification_status TEXT DEFAULT 'active' 
  CHECK (qualification_status IN ('active', 'through', 'eliminated'));

ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'group_stage';

ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS final_position INTEGER;

-- Add progression tracking columns to tournament_matches
ALTER TABLE tournament_matches 
ADD COLUMN IF NOT EXISTS is_qualification_match BOOLEAN DEFAULT false;

ALTER TABLE tournament_matches 
ADD COLUMN IF NOT EXISTS advances_to_match_id UUID REFERENCES tournament_matches(id);

-- Note: metadata column already exists, so we don't need to add it

-- Create tournament_progression table for tracking advancement history
CREATE TABLE IF NOT EXISTS tournament_progression (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id),
  team_id UUID REFERENCES tournament_teams(id),
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  match_id UUID REFERENCES tournament_matches(id),
  qualified_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on new table
ALTER TABLE tournament_progression ENABLE ROW LEVEL SECURITY;

-- Create policy for new table
CREATE POLICY "Allow public read access on tournament_progression" 
  ON tournament_progression FOR SELECT USING (true);