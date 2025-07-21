import { supabase } from '@/services/supabase';

export async function setupStorageBuckets() {
  try {
    // Check if vehicle-images bucket exists
    const { data: vehicleBucket, error: vehicleError } = await supabase.storage
      .getBucket('vehicle-images');
    
    if (vehicleError) {
      console.log('Creating vehicle-images bucket...');
      const { error: createVehicleError } = await supabase.storage
        .createBucket('vehicle-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (createVehicleError) {
        console.error('Error creating vehicle-images bucket:', createVehicleError);
      } else {
        console.log('vehicle-images bucket created successfully');
      }
    } else {
      console.log('vehicle-images bucket already exists');
    }

    // Check if part-images bucket exists
    const { data: partBucket, error: partError } = await supabase.storage
      .getBucket('part-images');
    
    if (partError) {
      console.log('Creating part-images bucket...');
      const { error: createPartError } = await supabase.storage
        .createBucket('part-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (createPartError) {
        console.error('Error creating part-images bucket:', createPartError);
      } else {
        console.log('part-images bucket created successfully');
      }
    } else {
      console.log('part-images bucket already exists');
    }
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
  }
} 