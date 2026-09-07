import { supabase } from '../supabaseClient'
import { WishlistItem } from '../../types/database'
import { DEMO_PROPERTIES } from './properties'

const DEMO_WISHLIST_KEY = 'smartspace_demo_wishlist'

function isDemoSession() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem('smartspace_demo_session'))
}

function readDemoWishlist(): WishlistItem[] {
  try {
    const ids = JSON.parse(localStorage.getItem(DEMO_WISHLIST_KEY) || '[]') as string[]
    return ids.map((propertyId, index) => ({
      id: `demo-wishlist-${index}`,
      customer_id: '',
      property_id: propertyId,
      property: DEMO_PROPERTIES.find((property) => property.id === propertyId),
    }))
  } catch {
    return []
  }
}

export async function getCustomerWishlist(customerId: string): Promise<WishlistItem[]> {
  if (isDemoSession()) return readDemoWishlist()

  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      *,
      property:properties(*, images:property_images(*), pricing_rules(*))
    `)
    .eq('customer_id', customerId)

  if (error) throw error
  return data as WishlistItem[]
}

export async function addToWishlist(customerId: string, propertyId: string) {
  if (isDemoSession()) {
    const ids = JSON.parse(localStorage.getItem(DEMO_WISHLIST_KEY) || '[]') as string[]
    if (!ids.includes(propertyId)) localStorage.setItem(DEMO_WISHLIST_KEY, JSON.stringify([...ids, propertyId]))
    return readDemoWishlist().find((item) => item.property_id === propertyId)
  }

  const { data, error } = await supabase
    .from('wishlist')
    .insert({
      customer_id: customerId,
      property_id: propertyId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFromWishlist(customerId: string, propertyId: string) {
  if (isDemoSession()) {
    const ids = JSON.parse(localStorage.getItem(DEMO_WISHLIST_KEY) || '[]') as string[]
    localStorage.setItem(DEMO_WISHLIST_KEY, JSON.stringify(ids.filter((id) => id !== propertyId)))
    return
  }

  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('customer_id', customerId)
    .eq('property_id', propertyId)

  if (error) throw error
}

export async function checkIsInWishlist(customerId: string, propertyId: string): Promise<boolean> {
  if (isDemoSession()) return readDemoWishlist().some((item) => item.property_id === propertyId)

  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('customer_id', customerId)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (error) return false
  return !!data
}
