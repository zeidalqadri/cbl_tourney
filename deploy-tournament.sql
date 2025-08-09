-- MSS Melaka 2025 Basketball Tournament - Complete Setup
-- Run this file in Supabase SQL Editor to set up the entire tournament

-- First, run the progression tracking schema updates
-- Add qualification status to tournament_teams
ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS qualification_status TEXT DEFAULT 'active' 
  CHECK (qualification_status IN ('active', 'through', 'eliminated'));

ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'group_stage';

ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS final_position INTEGER;

-- Add progression tracking to tournament_matches
ALTER TABLE tournament_matches 
ADD COLUMN IF NOT EXISTS is_qualification_match BOOLEAN DEFAULT false;

ALTER TABLE tournament_matches 
ADD COLUMN IF NOT EXISTS advances_to_match_id UUID REFERENCES tournament_matches(id);

ALTER TABLE tournament_matches 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create tournament progression history table
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

-- Create policies for new table
CREATE POLICY "Allow public read access on tournament_progression" 
  ON tournament_progression FOR SELECT USING (true);

-- Then run the seed-all-matches.sql content
-- This will load all 129 matches
-- (Content from seed-all-matches.sql should be copied here)

-- Finally, create a view to show current tournament status
CREATE OR REPLACE VIEW tournament_status AS
SELECT 
  (SELECT COUNT(*) FROM tournament_teams WHERE tournament_id = '66666666-6666-6666-6666-666666666666') as total_teams,
  (SELECT COUNT(*) FROM tournament_matches WHERE tournament_id = '66666666-6666-6666-6666-666666666666') as total_matches,
  (SELECT COUNT(*) FROM tournament_matches WHERE tournament_id = '66666666-6666-6666-6666-666666666666' AND status = 'completed') as completed_matches,
  (SELECT COUNT(*) FROM tournament_teams WHERE tournament_id = '66666666-6666-6666-6666-666666666666' AND qualification_status = 'through') as qualified_teams,
  (SELECT COUNT(*) FROM tournament_teams WHERE tournament_id = '66666666-6666-6666-6666-666666666666' AND qualification_status = 'eliminated') as eliminated_teams;