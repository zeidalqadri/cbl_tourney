-- Add media_content column to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS media_content JSONB DEFAULT '{"videos": [], "photos": []}'::jsonb;

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