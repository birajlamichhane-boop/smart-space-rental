import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { UserRole } from '../types/database'
import { Building2, AlertCircle } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

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

      if (error) throw error

      if (data.session) {
        navigate('/dashboard')
        return
      }

      // If email confirmation is disabled in Supabase, signInWithPassword will work immediately
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError && signInData.session) {
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

  const roleOptions = [
    { value: 'customer', label: 'Customer (Rent Spaces)' },
    { value: 'owner', label: 'Space Owner (List Properties)' },
    { value: 'staff', label: 'Staff Member' },
    { value: 'admin', label: 'Platform Admin' },
  ]

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 relative">
      <div className="ambient-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Card className="w-full max-w-md p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#E11D2E] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(225,29,46,0.4)]">
            <Building2 className="w-6 h-6 text-white" />
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
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+1 555-0199"
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
  )
}
