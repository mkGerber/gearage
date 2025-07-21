-- Complete storage setup and fix script
-- Run this in Supabase SQL Editor to fix all storage issues

-- 1. Enable storage if not already enabled
-- (This is usually done automatically, but just in case)

-- 2. Create storage buckets with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'part-images',
  'part-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload part images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own part images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own part images" ON storage.objects;

-- 4. Create comprehensive storage policies for vehicle-images
CREATE POLICY "Public read access for vehicle images" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can upload vehicle images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own vehicle images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-images' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR name NOT LIKE '%/%'
  )
);

CREATE POLICY "Users can delete their own vehicle images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-images' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR name NOT LIKE '%/%'
  )
);

-- 5. Create comprehensive storage policies for part-images
CREATE POLICY "Public read access for part images" ON storage.objects
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

-- 6. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 7. Verify the setup
SELECT 
  'vehicle-images' as bucket_name,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'vehicle-images'

UNION ALL

SELECT 
  'part-images' as bucket_name,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'part-images'; 