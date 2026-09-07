import { supabase } from '../supabaseClient'
import { Invoice } from '../../types/database'

const DEMO_INVOICES_KEY = 'smartspace_demo_invoices'

function isDemoSession() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem('smartspace_demo_session'))
}

function readDemoInvoices(): Invoice[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_INVOICES_KEY) || '[]') as Invoice[]
  } catch {
    return []
  }
}

export async function createInvoiceForBooking(bookingId: string, amount: number): Promise<Invoice> {
  if (isDemoSession()) {
    const existing = readDemoInvoices().find((invoice) => invoice.booking_id === bookingId)
    if (existing) return existing
    const invoice: Invoice = {
      id: `demo-invoice-${Date.now()}`,
      booking_id: bookingId,
      invoice_number: 1000 + readDemoInvoices().length,
      amount,
      generated_at: new Date().toISOString(),
    }
    localStorage.setItem(DEMO_INVOICES_KEY, JSON.stringify([invoice, ...readDemoInvoices()]))
    return invoice
  }

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
  if (isDemoSession()) return readDemoInvoices()

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
  if (isDemoSession()) return readDemoInvoices().find((invoice) => invoice.booking_id === bookingId) || null

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
