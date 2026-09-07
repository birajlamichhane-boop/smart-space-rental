import React, { useState, useEffect } from 'react'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { getAllBookingsStaffOrAdmin, updateBookingStatus } from '../../lib/queries/bookings'
import { Booking } from '../../types/database'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { ClipboardList, Check, X, RefreshCw } from 'lucide-react'

export const StaffDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await getAllBookingsStaffOrAdmin()
      setBookings(data)
    } catch (err) {
      console.error('Error fetching staff bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    setActionId(bookingId)
    try {
      await updateBookingStatus(bookingId, status)
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)))
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setActionId(null)
    }
  }

  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')

  return (
    <DashboardShell
      title="Staff Operations Dashboard"
      subtitle="Review upcoming customer reservations, confirm pending bookings, and assist space operations."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#E11D2E]" />
            <h2 className="text-lg font-semibold text-white">Bookings Operations Queue ({pendingBookings.length} Pending)</h2>
          </div>
          <Button variant="outline" size="sm" onClick={fetchBookings} className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0A0A0B] border-b border-[#262626] text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Starts At</th>
                  <th className="px-6 py-4">Ends At</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="h-6 w-full skeleton-shimmer" />
                    </td>
                  </tr>
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[#1C1C1F]/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {booking.property?.title || 'Space Listing'}
                      </td>
                      <td className="px-6 py-4">
                        {booking.customer?.full_name || 'Customer'}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(booking.starts_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(booking.ends_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        रू {booking.total_price?.toLocaleString('en-NP')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={booking.status}>{booking.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {booking.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              isLoading={actionId === booking.id}
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              isLoading={actionId === booking.id}
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs px-3 py-1"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px] font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 italic">
                      No customer bookings found in the queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}
