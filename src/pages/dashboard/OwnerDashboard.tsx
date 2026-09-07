import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { StatCard } from '../../components/dashboard/StatCard'
import { OccupancyChart } from '../../components/dashboard/OccupancyChart'
import { getOwnerProperties } from '../../lib/queries/properties'
import { getOwnerBookings } from '../../lib/queries/bookings'
import { Property, Booking } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'
import { Building2, CalendarCheck, DollarSign, PlusCircle, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOwnerData()
    }
  }, [user])

  const fetchOwnerData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [props, bks] = await Promise.all([
        getOwnerProperties(user.id),
        getOwnerBookings(user.id),
      ])
      setProperties(props)
      setBookings(bks)
    } catch (err) {
      console.error('Error fetching owner dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeBookings = bookings.filter((b) => b.status === 'confirmed')
  const monthlyRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0)

  const occupancyData = [
    { month: 'Jan', occupancy: 45 },
    { month: 'Feb', occupancy: 58 },
    { month: 'Mar', occupancy: 72 },
    { month: 'Apr', occupancy: 85 },
    { month: 'May', occupancy: 90 },
    { month: 'Jun', occupancy: 82 },
  ]

  return (
    <DashboardShell
      title="Space Owner Dashboard"
      subtitle="Manage your property listings, view live occupancy, and track earnings."
      actions={
        <Link to="/manage/properties">
          <Button size="sm" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add New Property
          </Button>
        </Link>
      }
    >
      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="My Listings"
          value={properties.length}
          icon={Building2}
        />
        <StatCard
          title="Active Confirmed Bookings"
          value={activeBookings.length}
          icon={CalendarCheck}
        />
        <StatCard
          title="Total Earnings"
          value={monthlyRevenue}
          prefix="रू "
          icon={DollarSign}
        />
      </div>

      {/* Occupancy Chart & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <OccupancyChart data={occupancyData} title="Property Occupancy Rate (%)" />
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <h3 className="text-sm font-semibold text-white">Recent Customer Bookings</h3>
            <Link to="/manage/properties" className="text-xs text-[#E11D2E] hover:underline flex items-center gap-1">
              Manage Listings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="p-3 rounded-lg bg-[#0A0A0B] border border-[#262626] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{b.property?.title || 'Space'}</h4>
                    <p className="text-[11px] text-zinc-400">Renter: {b.customer?.full_name || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">रू {b.total_price?.toLocaleString('en-NP')}</span>
                    <Badge variant={b.status} className="mt-1">{b.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center italic">No bookings on your properties yet.</p>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
