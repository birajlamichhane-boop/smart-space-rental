import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBookingById, updateBookingStatus } from '../../lib/queries/bookings'
import { getInvoiceByBookingId } from '../../lib/queries/invoices'
import { Booking, Invoice } from '../../types/database'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { CheckCircle2, FileText, Calendar, MapPin, Printer, ArrowLeft, Building2 } from 'lucide-react'

export const BookingConfirmPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (id) fetchBooking(id)
  }, [id])

  const fetchBooking = async (bId: string) => {
    setLoading(true)
    try {
      const b = await getBookingById(bId)
      setBooking(b)
      if (b) {
        const inv = await getInvoiceByBookingId(bId)
        setInvoice(inv)
      }
    } catch (err) {
      console.error('Error fetching booking confirmation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReservation = async () => {
    if (!booking) return
    setConfirming(true)
    try {
      await updateBookingStatus(booking.id, 'confirmed')
      await fetchBooking(booking.id)
    } catch (err) {
      console.error('Error confirming booking:', err)
    } finally {
      setConfirming(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="h-96 rounded-xl skeleton-shimmer" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Booking Not Found</h2>
        <p className="text-zinc-400 text-sm">We couldn't locate this booking record.</p>
        <Link to="/bookings">
          <Button size="sm">Back to My Bookings</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/bookings" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </Link>
        <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" /> Print / Save Invoice PDF
        </Button>
      </div>

      {/* Main Printable Confirmation Card */}
      <Card className="p-8 border-[#262626] bg-[#141416] space-y-8 shadow-2xl relative overflow-hidden print:border-none print:bg-white print:text-black">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-6 border-b border-[#262626] print:border-zinc-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#E11D2E] flex items-center justify-center text-white font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white print:text-black">SmartSpace Rentals</span>
            </div>
            <p className="text-xs text-zinc-400 print:text-zinc-600">Official Booking Summary & Printable Receipt</p>
          </div>
          <div className="text-right">
            <Badge variant={booking.status} className="text-sm px-3 py-1">
              {booking.status.toUpperCase()}
            </Badge>
            <p className="text-xs text-zinc-500 mt-2 print:text-zinc-600">
              Ref: <span className="font-mono">{booking.id.slice(0, 8)}</span>
            </p>
          </div>
        </div>

        {/* Status Confirmation Banner */}
        {booking.status === 'pending' && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 print:hidden">
            <div className="text-xs text-amber-300">
              <span className="font-bold block">Awaiting Confirmation</span>
              Confirm your reservation to automatically generate your official sequential invoice.
            </div>
            <Button size="sm" isLoading={confirming} onClick={handleConfirmReservation}>
              Confirm Reservation Now
            </Button>
          </div>
        )}

        {/* Invoice Info (if confirmed) */}
        {invoice && (
          <div className="p-4 rounded-lg bg-[#E11D2E]/10 border border-[#E11D2E]/30 flex items-center justify-between print:bg-zinc-100 print:border-zinc-300">
            <div>
              <span className="text-xs font-semibold text-[#E11D2E] uppercase tracking-wider block print:text-zinc-800">
                Official Invoice Number
              </span>
              <span className="text-2xl font-extrabold text-white font-mono print:text-black">
                #{invoice.invoice_number}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block print:text-zinc-600">Issued On</span>
              <span className="text-sm font-medium text-zinc-200 print:text-black">
                {new Date(invoice.generated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Property & Dates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block print:text-zinc-600">
              Space Details
            </span>
            <h3 className="font-bold text-white text-lg print:text-black">{booking.property?.title || 'Rental Space'}</h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 print:text-zinc-700">
              <MapPin className="w-4 h-4 text-[#E11D2E]" />
              {booking.property?.location || 'Location upon check-in'}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block print:text-zinc-600">
              Reservation Dates
            </span>
            <div className="space-y-1 text-xs">
              <p className="text-zinc-300 print:text-black">
                <span className="text-zinc-500 font-medium">Start:</span>{' '}
                {new Date(booking.starts_at).toLocaleString()}
              </p>
              <p className="text-zinc-300 print:text-black">
                <span className="text-zinc-500 font-medium">End:</span>{' '}
                {new Date(booking.ends_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Line Item Breakdown */}
        <div className="pt-6 border-t border-[#262626] print:border-zinc-300 space-y-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block print:text-zinc-600">
            Financial Statement
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-zinc-300 print:text-black py-1 border-b border-[#262626]/50">
              <span>Space Reservation Charge</span>
              <span>रू {booking.total_price?.toLocaleString('en-NP')}</span>
            </div>
            <div className="flex justify-between text-zinc-300 print:text-black py-1 border-b border-[#262626]/50">
              <span>Platform Service & Processing Fee</span>
              <span className="text-emerald-400">रू 0 (Included)</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white print:text-black pt-3">
              <span>Total Amount Paid / Due:</span>
              <span className="text-[#E11D2E] text-xl font-mono">रू {booking.total_price?.toLocaleString('en-NP')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
