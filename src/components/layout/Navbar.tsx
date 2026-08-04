import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { Building2, User, LogOut, Heart, Calendar, LayoutDashboard, CheckSquare, PlusCircle } from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const { role, isAdmin, isOwner, isCustomer } = useRole()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="glass-nav">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight group">
          <div className="w-9 h-9 rounded-lg bg-[#E11D2E] flex items-center justify-center shadow-[0_0_15px_rgba(225,29,46,0.5)] group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span>Smart<span className="text-[#E11D2E]">Space</span></span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <Link to="/properties" className="hover:text-white transition-colors">
            Explore Spaces
          </Link>

          {user && (
            <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4 text-[#E11D2E]" />
              Dashboard
            </Link>
          )}

          {isCustomer && (
            <>
              <Link to="/bookings" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                My Bookings
              </Link>
              <Link to="/wishlist" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#E11D2E]" />
                Wishlist
              </Link>
            </>
          )}

          {isOwner && (
            <Link to="/manage/properties" className="hover:text-white transition-colors flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Manage Spaces
            </Link>
          )}

          {isAdmin && (
            <Link to="/manage/approvals" className="hover:text-white transition-colors flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              Approvals
            </Link>
          )}
        </div>

        {/* Auth / User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg border border-[#262626] bg-[#141416] hover:bg-[#1C1C1F] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#E11D2E]/20 text-[#E11D2E] font-semibold flex items-center justify-center text-xs border border-[#E11D2E]/30">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-zinc-200 hidden sm:inline-block">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-[#E11D2E] hidden sm:inline-block">
                  {role}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border border-[#262626] bg-[#141416] p-1 shadow-2xl z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-[#1C1C1F] hover:text-white rounded-md transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-[#E11D2E] text-white hover:bg-[#FF2E44] shadow-[0_0_15px_rgba(225,29,46,0.35)] transition-all hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
