-- Add missing columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS division TEXT CHECK (division IN ('boys', 'girls'));
ALTER TABLE teams ADD COLUMN IF NOT EXISTS emblem_url TEXT;

-- Add missing columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time TIME;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS division TEXT CHECK (division IN ('boys', 'girls'));

-- Create tournament_specific tables for MSS Melaka 2025
CREATE TABLE IF NOT EXISTS tournament_teams (
  id TEXT PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  tournament_code TEXT DEFAULT 'MSS_MELAKA_2025',
  name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  division TEXT NOT NULL CHECK (division IN ('boys', 'girls')),
  emblem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS tournament_matches (
  id TEXT PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  tournament_code TEXT DEFAULT 'MSS_MELAKA_2025',
  match_number INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT NOT NULL,
  division TEXT NOT NULL CHECK (division IN ('boys', 'girls')),
  round TEXT NOT NULL,
  team_a_id TEXT REFERENCES tournament_teams(id),
  team_b_id TEXT REFERENCES tournament_teams(id),
  score_a INTEGER,
  score_b INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create result_cards table
CREATE TABLE IF NOT EXISTS result_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT REFERENCES tournament_matches(id),
  image_url TEXT NOT NULL,
  square_format_url TEXT NOT NULL,
  landscape_format_url TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on tournament_teams" ON tournament_teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access on tournament_matches" ON tournament_matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access on result_cards" ON result_cards FOR SELECT USING (true);

-- Add update trigger for tournament_matches
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tournament_matches_updated_at BEFORE UPDATE ON tournament_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();