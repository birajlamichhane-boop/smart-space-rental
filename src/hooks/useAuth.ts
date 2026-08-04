import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { getCurrentProfile } from '../lib/queries/profiles'
import { Profile } from '../types/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        getCurrentProfile(session.user.id).then((p) => {
          if (mounted) setProfile(p)
          if (mounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await getCurrentProfile(session.user.id)
        if (mounted) setProfile(p)
      } else {
        if (mounted) setProfile(null)
      }
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const refetchProfile = async () => {
    if (user) {
      const p = await getCurrentProfile(user.id)
      setProfile(p)
    }
  }

  return {
    user,
    session,
    profile,
    loading,
    refetchProfile,
    signOut: () => supabase.auth.signOut(),
  }
}
