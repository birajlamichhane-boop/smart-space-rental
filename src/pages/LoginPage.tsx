import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Building2, AlertCircle, Shield, UserCheck, Key, Sparkles } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      navigate(redirectPath)
    } catch (err: any) {
      console.error('Login error:', err)
      setErrorMsg(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemoLogin = async (demoEmail: string, demoRole: string, demoName: string) => {
    setEmail(demoEmail)
    setPassword('Password123!')
    setErrorMsg(null)
    setLoading(true)

    const demoPassword = 'Password123!'

    try {
      // 1. Try direct sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (!signInError && signInData.session) {
        navigate(redirectPath)
        return
      }

      // 2. If invalid credentials (user not in auth or hash mismatch), auto-create account via GoTrue API
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
        navigate(redirectPath)
        return
      }

      // 3. Retry sign in once created
      const { data: finalSignIn, error: finalErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (!finalErr && finalSignIn.session) {
        navigate(redirectPath)
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

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 relative">
      <div className="ambient-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Quick Demo Sign-In Buttons Card */}
        <Card className="p-5 border-[#E11D2E]/40 bg-[#141416]/90 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E11D2E]">
            <Sparkles className="w-4 h-4" />
            <span>1-Click Instant Demo Sign-In</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Click any role below to instantly log in to a pre-configured demo account:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('customer@smartspace.com', 'customer', 'Jordan Lee (Customer)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              👤 Customer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('owner@smartspace.com', 'owner', 'Marcus Sterling (Owner)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              🏢 Space Owner
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('staff@smartspace.com', 'staff', 'David Miller (Staff)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              📋 Operations Staff
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('admin@smartspace.com', 'admin', 'Alex Vance (Admin)')}
              className="text-xs justify-start border-zinc-700 hover:border-[#E11D2E]"
            >
              👑 Platform Admin
            </Button>
          </div>
          <p className="text-[10px] text-zinc-500 italic text-center pt-1">
            Password for all demo accounts: <code className="text-zinc-300 font-mono">Password123!</code>
          </p>
        </Card>

        {/* Regular Login Form Card */}
        <Card className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#E11D2E] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(225,29,46,0.4)]">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-zinc-400">Sign in to your SmartSpace account</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" isLoading={loading} className="w-full py-2.5">
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-zinc-400 border-t border-[#262626] pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#E11D2E] font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
