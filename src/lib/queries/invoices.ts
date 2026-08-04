import { supabase } from '../supabaseClient'
import { Invoice } from '../../types/database'

export async function createInvoiceForBooking(bookingId: string, amount: number): Promise<Invoice> {
  // Check if invoice already exists
  const { data: existing } = await supabase
    .from('invoices')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle()

  if (existing) {
    return existing as Invoice
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      booking_id: bookingId,
      amount,
    })
    .select(`
      *,
      booking:bookings(*, property:properties(*), customer:profiles(*))
    `)
    .single()

  if (error) throw error
  return data as Invoice
}

export async function getCustomerInvoices(customerId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      booking:bookings!inner(*, property:properties(*))
    `)
    .eq('booking.customer_id', customerId)
    .order('generated_at', { ascending: false })

  if (error) throw error
  return data as Invoice[]
}

export async function getInvoiceByBookingId(bookingId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      booking:bookings(*, property:properties(*), customer:profiles(*))
    `)
    .eq('booking_id', bookingId)
    .maybeSingle()

  if (error) return null
  return data as Invoice
}
