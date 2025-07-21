-- Enable Row Level Security

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT,
  mileage INTEGER NOT NULL,
  color TEXT NOT NULL,
  image TEXT,
  description TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parts table
CREATE TABLE IF NOT EXISTS parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'engine', 'exhaust', 'suspension', 'wheels', 'tires', 'brakes', 
    'interior', 'exterior', 'electronics', 'audio', 'performance', 
    'maintenance', 'other'
  )),
  brand TEXT,
  part_number TEXT,
  cost DECIMAL(10,2) NOT NULL,
  installation_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2) NOT NULL,
  mileage INTEGER NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  images TEXT[],
  links TEXT[],
  warranty TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('vehicle-images', 'vehicle-images', true),
  ('part-images', 'part-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_parts_vehicle_id ON parts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_date ON parts(date);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parts_updated_at ON parts;
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate total spent for vehicles
CREATE OR REPLACE FUNCTION calculate_vehicle_total_spent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vehicles 
  SET total_spent = (
    SELECT COALESCE(SUM(total_cost), 0)
    FROM parts 
    WHERE vehicle_id = NEW.vehicle_id
  )
  WHERE id = NEW.vehicle_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update vehicle total_spent when parts are modified
DROP TRIGGER IF EXISTS update_vehicle_total_spent ON parts;
CREATE TRIGGER update_vehicle_total_spent
  AFTER INSERT OR UPDATE OR DELETE ON parts
  FOR EACH ROW EXECUTE FUNCTION calculate_vehicle_total_spent();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, subscription)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Vehicles policies
DROP POLICY IF EXISTS "Users can view own vehicles" ON vehicles;
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vehicles" ON vehicles;
CREATE POLICY "Users can insert own vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;
CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own vehicles" ON vehicles;
CREATE POLICY "Users can delete own vehicles" ON vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Parts policies
DROP POLICY IF EXISTS "Users can view parts for own vehicles" ON parts;
CREATE POLICY "Users can view parts for own vehicles" ON parts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert parts for own vehicles" ON parts;
CREATE POLICY "Users can insert parts for own vehicles" ON parts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update parts for own vehicles" ON parts;
CREATE POLICY "Users can update parts for own vehicles" ON parts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete parts for own vehicles" ON parts;
CREATE POLICY "Users can delete parts for own vehicles" ON parts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = parts.vehicle_id 
      AND vehicles.user_id = auth.uid()
    )
  );

-- Storage policies
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 