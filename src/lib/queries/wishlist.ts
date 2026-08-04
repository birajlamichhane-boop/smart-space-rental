import { supabase } from '../supabaseClient'
import { WishlistItem } from '../../types/database'

export async function getCustomerWishlist(customerId: string): Promise<WishlistItem[]> {
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
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('customer_id', customerId)
    .eq('property_id', propertyId)

  if (error) throw error
}

export async function checkIsInWishlist(customerId: string, propertyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('customer_id', customerId)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (error) return false
  return !!data
}
