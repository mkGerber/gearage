import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helpers
export const db = {
  // Vehicles
  getVehicles: async (userId: string) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createVehicle: async (vehicle: any) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select()
      .single()
    return { data, error }
  },

  updateVehicle: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteVehicle: async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Parts
  getParts: async (userId: string) => {
    const { data, error } = await supabase
      .from('parts')
      .select(`
        *,
        vehicles!inner(user_id)
      `)
      .eq('vehicles.user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createPart: async (part: any) => {
    const { data, error } = await supabase
      .from('parts')
      .insert([part])
      .select()
      .single()
    return { data, error }
  },

  updatePart: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deletePart: async (id: string) => {
    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Users
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateUserProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },
}

// Storage helpers
export const storage = {
  uploadImage: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  getImageUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  deleteImage: async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { error }
  },
} 