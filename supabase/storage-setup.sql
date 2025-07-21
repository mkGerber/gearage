-- Storage Bucket Setup for Gearage App
-- Run this in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
  ('vehicle-images', 'vehicle-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('part-images', 'part-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for vehicle-images bucket
DROP POLICY IF EXISTS "Users can upload vehicle images" ON storage.objects;
CREATE POLICY "Users can upload vehicle images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vehicle-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view vehicle images" ON storage.objects;
CREATE POLICY "Users can view vehicle images" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Users can delete own vehicle images" ON storage.objects;
CREATE POLICY "Users can delete own vehicle images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vehicle-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for part-images bucket
DROP POLICY IF EXISTS "Users can upload part images" ON storage.objects;
CREATE POLICY "Users can upload part images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'part-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view part images" ON storage.objects;
CREATE POLICY "Users can view part images" ON storage.objects
  FOR SELECT USING (bucket_id = 'part-images');

DROP POLICY IF EXISTS "Users can delete own part images" ON storage.objects;
CREATE POLICY "Users can delete own part images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'part-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Grant necessary permissions for storage
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated; 