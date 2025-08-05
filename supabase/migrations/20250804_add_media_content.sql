-- Add media_content column to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS media_content JSONB DEFAULT '{"videos": [], "photos": []}'::jsonb;

-- Create index for faster queries on media content
CREATE INDEX IF NOT EXISTS idx_matches_media ON matches USING GIN (media_content);

-- Create media_uploads table for tracking uploads
CREATE TABLE IF NOT EXISTS media_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  upload_type VARCHAR(50) NOT NULL CHECK (upload_type IN ('video', 'photo', 'gallery')),
  platform VARCHAR(50) NOT NULL,
  uploaded_by VARCHAR(255),
  upload_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on media_uploads
CREATE INDEX IF NOT EXISTS idx_media_uploads_match ON media_uploads(match_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_type ON media_uploads(upload_type);
CREATE INDEX IF NOT EXISTS idx_media_uploads_created ON media_uploads(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for media_uploads
DROP TRIGGER IF EXISTS update_media_uploads_updated_at ON media_uploads;
CREATE TRIGGER update_media_uploads_updated_at 
  BEFORE UPDATE ON media_uploads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON COLUMN matches.media_content IS 'JSON storage for match media content including videos and photos';
COMMENT ON TABLE media_uploads IS 'Track all media uploads for matches including metadata';