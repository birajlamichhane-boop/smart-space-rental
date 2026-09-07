import React from 'react'
import { NavLink } from 'react-router-dom'
import { useRole } from '../../hooks/useRole'
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Heart,
  FileText,
  User,
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const { role, isAdmin, isOwner, isStaff, isCustomer } = useRole()

  const navItems = [
    ...(!isStaff ? [{ label: 'Overview', to: '/dashboard', icon: LayoutDashboard }] : []),
    ...(isCustomer
      ? [
          { label: 'My Bookings', to: '/bookings', icon: CalendarCheck },
          { label: 'Saved Wishlist', to: '/wishlist', icon: Heart },
        ]
      : []),
    ...(isOwner
      ? [
          { label: 'My Properties', to: '/manage/properties', icon: Building2 },
        ]
      : []),
    ...(isAdmin
      ? [
          { label: 'Pending Approvals', to: '/manage/approvals', icon: CheckCircle2 },
        ]
      : []),
    ...(isStaff
      ? [
          { label: 'Bookings Queue', to: '/dashboard', icon: FileText },
        ]
      : []),
    { label: 'Profile', to: '/profile', icon: User },
  ]

  return (
    <aside className="w-64 bg-[#141416] border-r border-[#262626] min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          {role} Navigation
        </div>
        <nav className="space-y-1">
            {navItems.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E11D2E]/10 text-[#E11D2E] border border-[#E11D2E]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1C1C1F]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 bg-[#0A0A0B] rounded-lg border border-[#262626]">
        <p className="text-xs text-zinc-400 font-medium">SmartSpace Platform</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Role: <span className="capitalize text-zinc-300">{role || 'Guest'}</span></p>
      </div>
    </aside>
  )
}
