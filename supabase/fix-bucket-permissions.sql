-- Fix bucket permissions for vehicle-images
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND qual LIKE '%vehicle-images%';

-- Drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Public read access for vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle images" ON storage.objects;

-- Create simple, permissive policies
CREATE POLICY "vehicle_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "vehicle_images_authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "vehicle_images_authenticated_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "vehicle_images_authenticated_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-images' 
  AND auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Verify the bucket is accessible
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'vehicle-images'; 