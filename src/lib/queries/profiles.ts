import { supabase } from '../supabaseClient'
import { Profile } from '../../types/database'

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data as Profile
}

export async function updateProfile(userId: string, updates: { full_name?: string; phone?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()

  if (error) throw error
  return data
}
