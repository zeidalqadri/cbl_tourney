-- Create storage bucket for match media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'match-media',
  'match-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Public read access on match-media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'match-media');

CREATE POLICY "Authenticated users can upload to match-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'match-media');

CREATE POLICY "Authenticated users can update their own uploads" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'match-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete their own uploads" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'match-media' AND auth.uid()::text = (storage.foldername(name))[1]);