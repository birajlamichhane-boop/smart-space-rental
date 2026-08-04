import React from 'react'
import { useRole } from '../../hooks/useRole'
import { AdminDashboard } from './AdminDashboard'
import { OwnerDashboard } from './OwnerDashboard'
import { StaffDashboard } from './StaffDashboard'
import { CustomerDashboard } from './CustomerDashboard'
import { Skeleton } from '../../components/ui/skeleton'

export const DashboardRouter: React.FC = () => {
  const { role, loading } = useRole()

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <div className="h-10 w-48 rounded skeleton-shimmer" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </div>
    )
  }

  if (role === 'admin') return <AdminDashboard />
  if (role === 'owner') return <OwnerDashboard />
  if (role === 'staff') return <StaffDashboard />
  return <CustomerDashboard />
}
