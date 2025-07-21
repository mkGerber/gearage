-- Fix Permissions for Gearage App
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON vehicles;

DROP POLICY IF EXISTS "Users can view parts for own vehicles" ON parts;
DROP POLICY IF EXISTS "Users can insert parts for own vehicles" ON parts;
DROP POLICY IF EXISTS "Users can update parts for own vehicles" ON parts;
DROP POLICY IF EXISTS "Users can delete parts for own vehicles" ON parts;

-- 3. Create Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create Vehicles policies
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" ON vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create Parts policies
CREATE POLICY "Users can view parts for own vehicles" ON parts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert parts for own vehicles" ON parts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update parts for own vehicles" ON parts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete parts for own vehicles" ON parts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 7. Grant storage permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 8. Create storage policies (if buckets exist)
DROP POLICY IF EXISTS "Users can upload vehicle images" ON storage.objects;
CREATE POLICY "Users can upload vehicle images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vehicle-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view vehicle images" ON storage.objects;
CREATE POLICY "Users can view vehicle images" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Users can upload part images" ON storage.objects;
CREATE POLICY "Users can upload part images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'part-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view part images" ON storage.objects;
CREATE POLICY "Users can view part images" ON storage.objects
  FOR SELECT USING (bucket_id = 'part-images');

-- 9. Test the setup
SELECT 
  'Profiles policies:' as info,
  count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
UNION ALL
SELECT 
  'Vehicles policies:' as info,
  count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'vehicles'
UNION ALL
SELECT 
  'Parts policies:' as info,
  count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'parts'; 