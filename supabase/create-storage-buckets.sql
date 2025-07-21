-- Create storage buckets for the app
-- Run this in Supabase SQL Editor

-- Create vehicle-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create part-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'part-images',
  'part-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vehicle-images bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can upload vehicle images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own vehicle images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own vehicle images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for part-images bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'part-images');

CREATE POLICY "Authenticated users can upload part images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'part-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own part images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'part-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own part images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'part-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 