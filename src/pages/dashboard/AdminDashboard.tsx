import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { StatCard } from '../../components/dashboard/StatCard'
import { RevenueChart } from '../../components/dashboard/RevenueChart'
import { getAllPropertiesAdmin, getPendingProperties } from '../../lib/queries/properties'
import { getAllBookingsStaffOrAdmin } from '../../lib/queries/bookings'
import { Property, Booking } from '../../types/database'
import { Building2, CheckSquare, Calendar, DollarSign, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export const AdminDashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [pendingProperties, setPendingProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    setLoading(true)
    try {
      const [allProps, pendingProps, allBookings] = await Promise.all([
        getAllPropertiesAdmin(),
        getPendingProperties(),
        getAllBookingsStaffOrAdmin(),
      ])

      setProperties(allProps)
      setPendingProperties(pendingProps)
      setBookings(allBookings)
    } catch (err) {
      console.error('Error loading admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0)

  const revenueData = [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 6800 },
    { month: 'Mar', revenue: 8500 },
    { month: 'Apr', revenue: 11200 },
    { month: 'May', revenue: 14600 },
    { month: 'Jun', revenue: totalRevenue || 18500 },
  ]

  return (
    <DashboardShell
      title="Admin Platform Dashboard"
      subtitle="Overview of system properties, approvals, bookings, and financial performance."
      actions={
        <Link to="/manage/approvals">
          <Button size="sm" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Review Pending ({pendingProperties.length})
          </Button>
        </Link>
      }
    >
      {/* Stat Cards Row - Exactly 4 in a row max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={properties.length}
          icon={Building2}
          trend="+12% this month"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingProperties.length}
          icon={CheckSquare}
        />
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          icon={Calendar}
          trend="+18% overall"
        />
        <StatCard
          title="Platform Revenue"
          value={totalRevenue}
          prefix="रू "
          icon={DollarSign}
          trend="+24% Q2"
        />
      </div>

      {/* Analytics Chart & Quick Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} title="System-wide Revenue Trend (रू)" />
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <h3 className="text-sm font-semibold text-white">Approvals Queue</h3>
            <Link to="/manage/approvals" className="text-xs text-[#E11D2E] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingProperties.length > 0 ? (
            <div className="space-y-3">
              {pendingProperties.slice(0, 4).map((prop) => (
                <div key={prop.id} className="p-3 rounded-lg bg-[#0A0A0B] border border-[#262626] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{prop.title}</h4>
                    <p className="text-[11px] text-zinc-400 capitalize">{prop.type} • Owner: {prop.owner?.full_name || 'Owner'}</p>
                  </div>
                  <Badge variant="pending">Pending</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center italic">No pending property approvals.</p>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
