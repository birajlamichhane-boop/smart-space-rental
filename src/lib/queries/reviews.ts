import { supabase } from '../supabaseClient'
import { Review } from '../../types/database'

export async function getPropertyReviews(propertyId: string): Promise<Review[]> {
  if (typeof window !== 'undefined' && localStorage.getItem('smartspace_demo_session')) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:profiles(*)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Review[]
  } catch (error) {
    console.warn('Reviews unavailable, showing the property without reviews:', error)
    return []
  }
}

export async function createReview(params: {
  property_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      property_id: params.property_id,
      customer_id: params.customer_id,
      rating: params.rating,
      comment: params.comment || null,
    })
    .select(`
      *,
      customer:profiles(*)
    `)
    .single()

  if (error) throw error
  return data as Review
}
