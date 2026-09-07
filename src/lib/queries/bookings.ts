import { supabase } from '../supabaseClient'
import { Booking, BookingStatus } from '../../types/database'
import { createInvoiceForBooking } from './invoices'
import { DEMO_PROPERTIES } from './properties'

const DEMO_BOOKINGS_KEY = 'smartspace_demo_bookings'

function isDemoSession() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem('smartspace_demo_session'))
}

function readDemoBookings(): Booking[] {
  if (!isDemoSession()) return []
  try {
    const bookings = JSON.parse(localStorage.getItem(DEMO_BOOKINGS_KEY) || '[]') as Booking[]
    const seen = new Set<string>()
    return bookings.filter((booking) => {
      const key = `${booking.property_id}:${booking.starts_at}:${booking.ends_at}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  } catch {
    return []
  }
}

function writeDemoBookings(bookings: Booking[]) {
  localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings))
}

function ensureDemoOperationsBooking(bookings: Booking[]): Booking[] {
  if (bookings.some((booking) => booking.id === 'demo-operations-booking' || booking.status === 'pending')) return bookings

  const property = DEMO_PROPERTIES[1] || DEMO_PROPERTIES[0]
  const start = new Date()
  start.setDate(start.getDate() + 3)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  const demoBooking: Booking = {
    id: 'demo-operations-booking',
    property_id: property.id,
    customer_id: 'd1111111-1111-4111-d111-111111111111',
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    total_price: property.base_price,
    status: 'pending',
    created_at: new Date().toISOString(),
    property,
    customer: {
      id: 'd1111111-1111-4111-d111-111111111111',
      role: 'customer',
      full_name: 'Sita Sharma (Customer)',
      phone: '+977 9841000007',
      created_at: new Date().toISOString(),
    },
  }
  return [demoBooking, ...bookings]
}

export async function createBooking(params: {
  property_id: string;
  customer_id: string;
  starts_at: string;
  ends_at: string;
  total_price: number;
}): Promise<Booking> {
  if (isDemoSession()) {
    const booking: Booking = {
      id: `demo-booking-${Date.now()}`,
      property_id: params.property_id,
      customer_id: params.customer_id,
      starts_at: params.starts_at,
      ends_at: params.ends_at,
      total_price: params.total_price,
      status: 'pending',
      created_at: new Date().toISOString(),
      property: DEMO_PROPERTIES.find((property) => property.id === params.property_id),
    }
    writeDemoBookings([booking, ...readDemoBookings()])
    return booking
  }

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', params.property_id)
    .eq('status', 'approved')
    .maybeSingle()

  if (propertyError) throw new Error('Unable to verify this property. Please refresh and try again.')
  if (!property) throw new Error('This property is no longer available for booking.')

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      property_id: params.property_id,
      customer_id: params.customer_id,
      starts_at: params.starts_at,
      ends_at: params.ends_at,
      total_price: params.total_price,
      status: 'pending',
    })
    .select(`
      *,
      property:properties(*),
      customer:profiles(*)
    `)
    .single()

  if (error) {
    // Check if error is due to exclusion constraint violation (Postgres error code 23P01) or constraint message
    if (error.code === '23P01' || error.message.includes('conflicting key value violates exclusion constraint') || error.message.includes('bookings_property_id_tstzrange_excl')) {
      throw new Error('This property is already booked for those dates.')
    }
    throw new Error(error.message || 'Failed to create booking.')
  }

  return data as Booking
}

export async function getCustomerBookings(customerId: string): Promise<Booking[]> {
  if (isDemoSession()) {
    return readDemoBookings().filter((booking) => booking.customer_id === customerId)
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*, images:property_images(*)),
      invoice:invoices(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Booking[]
}

export async function getOwnerBookings(ownerId: string): Promise<Booking[]> {
  if (isDemoSession()) {
    return readDemoBookings().filter((booking) => booking.property?.owner_id === ownerId)
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties!inner(*),
      customer:profiles(*),
      invoice:invoices(*)
    `)
    .eq('property.owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Booking[]
}

export async function getAllBookingsStaffOrAdmin(): Promise<Booking[]> {
  if (isDemoSession()) {
    const bookings = ensureDemoOperationsBooking(readDemoBookings())
    writeDemoBookings(bookings)
    return bookings
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*),
      customer:profiles(*),
      invoice:invoices(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Booking[]
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  if (isDemoSession()) {
    return readDemoBookings().find((booking) => booking.id === bookingId) || null
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*, images:property_images(*)),
      customer:profiles(*),
      invoice:invoices(*)
    `)
    .eq('id', bookingId)
    .single()

  if (error) return null
  return data as Booking
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus, totalPrice?: number) {
  if (isDemoSession()) {
    const bookings = readDemoBookings()
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking) throw new Error('Booking not found.')
    booking.status = status
    if (totalPrice !== undefined) booking.total_price = totalPrice
    writeDemoBookings(bookings)
    if (status === 'confirmed') {
      await createInvoiceForBooking(bookingId, booking.total_price ?? 0)
    }
    return booking
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error

  // If status is updated to confirmed, auto-generate invoice
  if (status === 'confirmed') {
    const finalAmount = totalPrice ?? data.total_price ?? 0
    try {
      await createInvoiceForBooking(bookingId, finalAmount)
    } catch (invErr) {
      console.warn('Invoice generation warning (may already exist):', invErr)
    }
  }

  return data
}
