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

    const checkDemoSession = () => {
      const demoRaw = localStorage.getItem('smartspace_demo_session')
      if (demoRaw) {
        try {
          const demo = JSON.parse(demoRaw)
          if (mounted) {
            setUser(demo.user)
            setProfile(demo.profile)
            setSession(null)
            setLoading(false)
          }
          return true
        } catch {}
      }
      return false
    }

    if (checkDemoSession()) {
      const handleAuthChange = () => checkDemoSession()
      window.addEventListener('smartspace_auth_change', handleAuthChange)
      return () => {
        mounted = false
        window.removeEventListener('smartspace_auth_change', handleAuthChange)
      }
    }

    // Fetch initial Supabase session
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

    const handleCustomChange = () => {
      if (!checkDemoSession()) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!mounted) return
          setSession(session)
          setUser(session?.user ?? null)
        })
      }
    }
    window.addEventListener('smartspace_auth_change', handleCustomChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('smartspace_auth_change', handleCustomChange)
    }
  }, [])

  const refetchProfile = async () => {
    const demoRaw = localStorage.getItem('smartspace_demo_session')
    if (demoRaw) {
      try {
        const demo = JSON.parse(demoRaw)
        setProfile(demo.profile)
        return
      } catch {}
    }
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
    signOut: async () => {
      localStorage.removeItem('smartspace_demo_session')
      await supabase.auth.signOut()
      window.dispatchEvent(new Event('smartspace_auth_change'))
    },
  }
}

