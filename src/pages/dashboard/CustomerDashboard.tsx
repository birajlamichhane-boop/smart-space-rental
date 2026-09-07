import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { StatCard } from '../../components/dashboard/StatCard'
import { getCustomerBookings } from '../../lib/queries/bookings'
import { getCustomerInvoices } from '../../lib/queries/invoices'
import { getCustomerWishlist } from '../../lib/queries/wishlist'
import { Booking, Invoice } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'
import { Calendar, Heart, FileText, Download, Building2, ArrowRight } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCustomerData()
    }
  }, [user])

  const fetchCustomerData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [bks, invs, wish] = await Promise.all([
        getCustomerBookings(user.id),
        getCustomerInvoices(user.id),
        getCustomerWishlist(user.id),
      ])
      setBookings(bks)
      setInvoices(invs)
      setWishlistCount(wish.length)
    } catch (err) {
      console.error('Error fetching customer data:', err)
    } finally {
      setLoading(false)
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.starts_at) >= new Date() && b.status !== 'cancelled'
  )
  const pastBookings = bookings.filter(
    (b) => new Date(b.starts_at) < new Date() || b.status === 'cancelled'
  )

  return (
    <DashboardShell
      title="My Customer Hub"
      subtitle="View your active reservations, invoice history, and saved properties."
      actions={
        <Link to="/properties">
          <Button size="sm" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Explore More Spaces
          </Button>
        </Link>
      }
    >
      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Upcoming Reservations"
          value={upcomingBookings.length}
          icon={Calendar}
        />
        <StatCard
          title="Past & Completed Stays"
          value={pastBookings.length}
          icon={FileText}
        />
        <StatCard
          title="Saved Wishlist Spaces"
          value={wishlistCount}
          icon={Heart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Bookings List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Your Reservations</h3>
            <Link to="/bookings" className="text-xs text-[#E11D2E] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((b) => (
                <Card key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-base">{b.property?.title || 'Space Listing'}</h4>
                      <Badge variant={b.status}>{b.status}</Badge>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {new Date(b.starts_at).toLocaleDateString()} — {new Date(b.ends_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#262626]">
                    <span className="text-lg font-bold text-white">रू {b.total_price?.toLocaleString('en-NP')}</span>
                    <Link to={`/bookings/${b.id}/confirm`}>
                      <Button variant="outline" size="sm">
                        Invoice & Summary
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">No upcoming reservations found.</p>
            </Card>
          )}
        </div>

        {/* Invoices List */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E11D2E]" /> Sequential Invoices
            </h3>
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-3.5 rounded-lg bg-[#0A0A0B] border border-[#262626] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">#{inv.invoice_number}</span>
                    <span className="text-[11px] text-zinc-400">{new Date(inv.generated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#E11D2E] block">रू {inv.amount.toLocaleString('en-NP')}</span>
                    <Link to={`/bookings/${inv.booking_id}/confirm`} className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 mt-0.5 justify-end">
                      <Download className="w-3 h-3" /> View PDF
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center italic">No generated invoices yet.</p>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
