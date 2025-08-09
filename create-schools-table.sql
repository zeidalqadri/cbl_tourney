-- Create schools table for parent-child relationship
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL UNIQUE,
  school_type TEXT CHECK (school_type IN ('boys_only', 'girls_only', 'co_ed')),
  address TEXT,
  contact_info JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add school reference to tournament_teams
ALTER TABLE tournament_teams 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_teams_school_id ON tournament_teams(school_id);
CREATE INDEX IF NOT EXISTS idx_schools_school_name ON schools(school_name);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();