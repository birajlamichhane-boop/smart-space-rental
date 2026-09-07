import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Property, RateType } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'
import { createBooking } from '../../lib/queries/bookings'
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { differenceInHours, differenceInDays, differenceInMonths, parseISO, addDays } from 'date-fns'

interface BookingCalendarProps {
  property: Property;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ property }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowStr = addDays(new Date(), 1).toISOString().split('T')[0]

  const [rateType, setRateType] = useState<RateType>('daily')
  const [startDate, setStartDate] = useState(todayStr)
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(tomorrowStr)
  const [endTime, setEndTime] = useState('17:00')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Find pricing rule or fallback to base_price
  const currentRateAmount = useMemo(() => {
    const rule = property.pricing_rules?.find((r) => r.rate_type === rateType)
    if (rule) return rule.amount
    if (rateType === 'hourly') return Math.round(property.base_price / 8)
    if (rateType === 'monthly') return property.base_price * 25
    return property.base_price
  }, [property, rateType])

  // Calculate duration and total price
  const { duration, durationUnit, totalPrice } = useMemo(() => {
    try {
      const startDT = parseISO(`${startDate}T${startTime}:00`)
      const endDT = parseISO(`${endDate}T${endTime}:00`)

      if (isNaN(startDT.getTime()) || isNaN(endDT.getTime()) || endDT <= startDT) {
        return { duration: 0, durationUnit: rateType, totalPrice: 0 }
      }

      if (rateType === 'hourly') {
        const hrs = Math.max(1, differenceInHours(endDT, startDT))
        return { duration: hrs, durationUnit: 'hours', totalPrice: hrs * currentRateAmount }
      } else if (rateType === 'monthly') {
        const mths = Math.max(1, differenceInMonths(endDT, startDT))
        return { duration: mths, durationUnit: 'months', totalPrice: mths * currentRateAmount }
      } else {
        const days = Math.max(1, differenceInDays(endDT, startDT))
        return { duration: days, durationUnit: 'days', totalPrice: days * currentRateAmount }
      }
    } catch {
      return { duration: 0, durationUnit: rateType, totalPrice: 0 }
    }
  }, [startDate, startTime, endDate, endTime, rateType, currentRateAmount])

  const handleReserve = async () => {
    setErrorMsg(null)

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    const startDTStr = `${startDate}T${startTime}:00Z`
    const endDTStr = `${endDate}T${endTime}:00Z`

    if (new Date(endDTStr) <= new Date(startDTStr)) {
      setErrorMsg('End date & time must be strictly after start date & time.')
      return
    }

    setLoading(true)
    try {
      const booking = await createBooking({
        property_id: property.id,
        customer_id: user.id,
        starts_at: startDTStr,
        ends_at: endDTStr,
        total_price: totalPrice,
      })

      navigate(`/bookings/${booking.id}/confirm`)
    } catch (err: any) {
      console.error('Booking failed:', err)
      setErrorMsg(err.message || 'Failed to create booking.')
    } finally {
      setLoading(false)
    }
  }

  const rateOptions = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'daily', label: 'Daily Rate' },
    { value: 'monthly', label: 'Monthly Rate' },
  ]

  return (
    <Card className="p-6 border-[#E11D2E]/30 shadow-[0_0_30px_rgba(225,29,46,0.08)] sticky top-24">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#262626]">
        <div>
          <span className="text-2xl font-bold text-white">रू {currentRateAmount.toLocaleString('en-NP')}</span>
          <span className="text-xs text-zinc-400 font-normal"> / {rateType.replace('ly', '')}</span>
        </div>
        <div className="w-48">
          <Select
            options={rateOptions}
            value={rateType}
            onChange={(e) => setRateType(e.target.value as RateType)}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Start Date & Time */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#E11D2E]" /> Check-In / Start
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
        </div>

        {/* End Date & Time */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#E11D2E]" /> Check-Out / End
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        {/* Pricing Summary Box */}
        <div className="p-4 rounded-lg bg-[#0A0A0B] border border-[#262626] space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Duration:</span>
            <span className="font-semibold text-zinc-200">{duration} {durationUnit}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Rate:</span>
            <span className="font-semibold text-zinc-200">रू {currentRateAmount.toLocaleString('en-NP')} / {rateType.replace('ly', '')}</span>
          </div>
          <div className="pt-2 border-t border-[#262626] flex justify-between text-sm font-bold text-white">
            <span>Total Estimated Price:</span>
            <span className="text-[#E11D2E] text-base">रू {totalPrice.toLocaleString('en-NP')}</span>
          </div>
        </div>

        {/* Action Reserve Button */}
        <Button
          onClick={handleReserve}
          isLoading={loading}
          className="w-full py-3 text-base font-semibold"
        >
          {user ? 'Reserve Space Now' : 'Sign In to Reserve'}
        </Button>
      </div>
    </Card>
  )
}
