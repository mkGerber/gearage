-- Simple storage fix - more permissive policies
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for part images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload part images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own part images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own part images" ON storage.objects;

-- Create simple, permissive policies for vehicle-images
CREATE POLICY "Public read access for vehicle images" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can upload vehicle images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update vehicle images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete vehicle images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

-- Create simple, permissive policies for part-images
CREATE POLICY "Public read access for part images" ON storage.objects
FOR SELECT USING (bucket_id = 'part-images');

CREATE POLICY "Authenticated users can upload part images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'part-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update part images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'part-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete part images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'part-images' 
  AND auth.role() = 'authenticated'
); 