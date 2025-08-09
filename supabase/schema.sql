-- Create teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  division TEXT NOT NULL CHECK (division IN ('boys', 'girls')),
  emblem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create matches table
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  match_number INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT NOT NULL,
  division TEXT NOT NULL CHECK (division IN ('boys', 'girls')),
  round TEXT NOT NULL,
  team_a_id TEXT REFERENCES teams(id),
  team_b_id TEXT REFERENCES teams(id),
  score_a INTEGER,
  score_b INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create result_cards table
CREATE TABLE result_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT REFERENCES matches(id),
  image_url TEXT NOT NULL,
  square_format_url TEXT NOT NULL,
  landscape_format_url TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create group_standings view
CREATE VIEW group_standings AS
WITH match_results AS (
  SELECT 
    t.group_name,
    t.division,
    t.id as team_id,
    t.name as team_name,
    m.id as match_id,
    CASE 
      WHEN m.team_a_id = t.id AND m.score_a > m.score_b THEN 1
      WHEN m.team_b_id = t.id AND m.score_b > m.score_a THEN 1
      ELSE 0
    END as won,
    CASE 
      WHEN m.team_a_id = t.id AND m.score_a < m.score_b THEN 1
      WHEN m.team_b_id = t.id AND m.score_b < m.score_a THEN 1
      ELSE 0
    END as lost,
    CASE 
      WHEN m.team_a_id = t.id OR m.team_b_id = t.id THEN 1
      ELSE 0
    END as played
  FROM teams t
  LEFT JOIN matches m ON (m.team_a_id = t.id OR m.team_b_id = t.id) AND m.status = 'completed'
)
SELECT 
  group_name,
  division,
  team_id,
  team_name,
  SUM(played) as played,
  SUM(won) as won,
  SUM(lost) as lost,
  SUM(won) * 2 as points
FROM match_results
GROUP BY group_name, division, team_id, team_name
ORDER BY group_name, points DESC, won DESC;

-- Create indexes
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_division ON matches(division);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_teams_group ON teams(group_name, division);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Allow public read access on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access on result_cards" ON result_cards FOR SELECT USING (true);

-- Create update trigger for matches
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();