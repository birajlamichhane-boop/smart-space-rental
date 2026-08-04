import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCustomerBookings } from '../../lib/queries/bookings'
import { Booking } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Calendar, FileText, ArrowRight } from 'lucide-react'

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getCustomerBookings(user.id)
      setBookings(data)
    } catch (err) {
      console.error('Error fetching customer bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#E11D2E]" /> My Space Reservations
        </h1>
        <p className="text-sm text-zinc-400 mt-1">View your active, pending, and past rental bookings.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <img
                  src={booking.property?.images?.[0]?.storage_path || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80'}
                  alt={booking.property?.title}
                  className="w-20 h-20 rounded-lg object-cover bg-[#1C1C1F] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{booking.property?.title || 'Space Listing'}</h3>
                    <Badge variant={booking.status}>{booking.status}</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Check-in: <span className="text-zinc-200">{new Date(booking.starts_at).toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-zinc-400">
                    Check-out: <span className="text-zinc-200">{new Date(booking.ends_at).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[#262626]">
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">Total Price</span>
                  <span className="text-xl font-bold text-white">${booking.total_price}</span>
                </div>
                <Link to={`/bookings/${booking.id}/confirm`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#E11D2E]" /> Invoice & Details <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 space-y-3">
          <Calendar className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No Bookings Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You haven't reserved any spaces yet. Explore our properties to book your next stay or event space!
          </p>
          <Link to="/properties" className="inline-block pt-2">
            <Button size="sm">Explore Spaces</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
