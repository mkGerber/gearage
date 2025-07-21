-- Diagnostic SQL for Gearage App
-- Run this in your Supabase SQL Editor to check setup

-- Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'vehicles', 'parts')
ORDER BY table_name;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'vehicles', 'parts');

-- Check RLS policies
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
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'vehicles', 'parts')
ORDER BY tablename, policyname;

-- Check storage buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('vehicle-images', 'part-images');

-- Check storage policies
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
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- Test insert permissions (run this as the authenticated user)
-- This will help identify if the issue is with RLS policies
SELECT 
  has_table_privilege('authenticated', 'vehicles', 'INSERT') as can_insert_vehicles,
  has_table_privilege('authenticated', 'profiles', 'INSERT') as can_insert_profiles,
  has_table_privilege('authenticated', 'parts', 'INSERT') as can_insert_parts; 