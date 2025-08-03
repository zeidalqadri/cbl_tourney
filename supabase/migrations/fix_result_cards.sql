-- Drop existing result_cards table if it exists
DROP TABLE IF EXISTS result_cards CASCADE;

-- Create result_cards table with proper foreign key type
CREATE TABLE result_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  tournament_match_id TEXT,
  image_url TEXT NOT NULL,
  square_format_url TEXT NOT NULL,
  landscape_format_url TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE result_cards ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow public read access on result_cards" ON result_cards FOR SELECT USING (true);