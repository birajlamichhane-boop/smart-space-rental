import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../lib/queries/profiles'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { User, Phone, Mail, Shield, CheckCircle2 } from 'lucide-react'

export const ProfilePage: React.FC = () => {
  const { user, profile, refetchProfile } = useAuth()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [updating, setUpdating] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    setSuccessMsg(false)
    try {
      await updateProfile(user.id, { full_name: fullName, phone })
      await refetchProfile()
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-[#E11D2E]" /> User Profile & Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account information and view assigned role credentials.</p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#262626]">
          <div className="w-16 h-16 rounded-full bg-[#E11D2E]/20 text-[#E11D2E] font-bold text-2xl flex items-center justify-center border border-[#E11D2E]/40">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.full_name || 'Account User'}</h2>
            <p className="text-xs text-zinc-400">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Assigned Role:</span>
              <Badge variant="neutral" className="uppercase font-bold text-[10px] text-[#E11D2E] border-[#E11D2E]/30 bg-[#E11D2E]/10">
                {profile?.role || 'customer'}
              </Badge>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sita Sharma"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+977 9812345678"
          />

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Registered Email (Read-Only)</label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-[#0A0A0B] text-zinc-400 border-zinc-800"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={updating} className="px-6">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
