import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { UserRole } from '../types/database'
import { AlertCircle, Sparkles } from 'lucide-react'
import { BrandMark } from '../components/layout/BrandMark'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsRateLimited(false)

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role,
          },
        },
      })

      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
          setIsRateLimited(true)
          throw new Error('Supabase Auth rate limit reached for new registrations on your IP/project. Please use 1-Click Demo Login below to test any role instantly!')
        }
        throw error
      }

      if (data.session) {
        localStorage.removeItem('smartspace_demo_session')
        window.dispatchEvent(new Event('smartspace_auth_change'))
        navigate('/dashboard')
        return
      }

      // If email confirmation is disabled in Supabase, signInWithPassword will work immediately
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError && signInData.session) {
        localStorage.removeItem('smartspace_demo_session')
        window.dispatchEvent(new Event('smartspace_auth_change'))
        navigate('/dashboard')
      } else {
        setErrorMsg('Account created! If email confirmation is enabled in your Supabase project settings, please check your inbox or sign in below.')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setErrorMsg(err.message || 'Failed to register account.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemoLogin = async (demoEmail: string, demoRole: string, demoName: string) => {
    setLoading(true)
    setErrorMsg(null)
    const demoPassword = 'Password123!'

    try {
      // 1. Try direct sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (!signInError && signInData.session) {
        navigate('/dashboard')
        return
      }

      // 2. Auto-create account via GoTrue API if missing or hash mismatched
      const { data: signUpData } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: demoName,
            role: demoRole,
          },
        },
      })

      if (signUpData?.session) {
        navigate('/dashboard')
        return
      }

      // 3. Retry sign in
      const { data: finalSignIn, error: finalErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (!finalErr && finalSignIn.session) {
        navigate('/dashboard')
      } else {
        throw new Error(finalErr?.message || signInError?.message || 'Login failed.')
      }
    } catch (err: any) {
      console.error('Demo login error:', err)
      setErrorMsg(err.message || 'Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: 'customer', label: 'Customer (Rent Spaces)' },
    { value: 'owner', label: 'Space Owner (List Properties)' },
    { value: 'staff', label: 'Staff Member' },
    { value: 'admin', label: 'Platform Admin' },
  ]

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 relative">
      <div className="ambient-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Rate limit fallback demo banner */}
        <Card className="p-5 border-[#E11D2E]/40 bg-[#141416]/90 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E11D2E]">
            <Sparkles className="w-4 h-4" />
            <span>Instant Demo Sign-In (No Signup Needed)</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Click any pre-created account below to test the platform instantly:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('customer@smartspace.com', 'customer', 'Sita Sharma (Customer)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              👤 Customer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('owner@smartspace.com', 'owner', 'Aayush Thapa (Owner)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              🏢 Space Owner
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('staff@smartspace.com', 'staff', 'Nabin Gurung (Staff)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              📋 Operations Staff
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('admin@smartspace.com', 'admin', 'Pragya Shrestha (Admin)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              👑 Platform Admin
            </Button>
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-fit">
              <BrandMark />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create an Account</h1>
            <p className="text-xs text-zinc-400">Join SmartSpace as a customer, owner, staff, or admin</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Sita Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="sita@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              inputMode="tel"
              placeholder="+977 9812345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Select
              label="Account Role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" isLoading={loading} className="w-full py-2.5">
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-zinc-400 border-t border-[#262626] pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E11D2E] font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
