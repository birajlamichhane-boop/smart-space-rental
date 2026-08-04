import { supabase } from '../supabaseClient'
import { Booking, BookingStatus } from '../../types/database'
import { createInvoiceForBooking } from './invoices'

export async function createBooking(params: {
  property_id: string;
  customer_id: string;
  starts_at: string;
  ends_at: string;
  total_price: number;
}): Promise<Booking> {
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
