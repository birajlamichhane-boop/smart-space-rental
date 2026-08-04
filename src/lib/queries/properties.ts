import { supabase } from '../supabaseClient'
import { Property, PropertyType, PropertyStatus, RateType } from '../../types/database'

export async function getApprovedProperties(filters?: { type?: PropertyType | 'all'; minPrice?: number; maxPrice?: number; search?: string }): Promise<Property[]> {
  let query = supabase
    .from('properties')
    .select(`
      *,
      owner:profiles(*),
      images:property_images(*),
      pricing_rules(*),
      reviews(*)
    `)
    .eq('status', 'approved')

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('base_price', filters.minPrice)
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('base_price', filters.maxPrice)
  }

  if (filters?.search && filters.search.trim() !== '') {
    query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles(*),
      images:property_images(*),
      pricing_rules(*),
      reviews(*, customer:profiles(*))
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property detail:', error)
    return null
  }
  return data as Property
}

export async function getOwnerProperties(ownerId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      images:property_images(*),
      pricing_rules(*)
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export async function getPendingProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles(*),
      images:property_images(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export async function getAllPropertiesAdmin(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export async function createProperty(property: {
  owner_id: string;
  type: PropertyType;
  title: string;
  description?: string;
  location?: string;
  base_price: number;
  rates: { rate_type: RateType; amount: number }[];
  image_urls?: string[];
}) {
  // 1. Insert Property
  const { data: prop, error: propErr } = await supabase
    .from('properties')
    .insert({
      owner_id: property.owner_id,
      type: property.type,
      title: property.title,
      description: property.description || null,
      location: property.location || null,
      base_price: property.base_price,
      status: 'pending',
    })
    .select()
    .single()

  if (propErr) throw propErr

  // 2. Insert Pricing Rules
  if (property.rates && property.rates.length > 0) {
    const rulesToInsert = property.rates.map(r => ({
      property_id: prop.id,
      rate_type: r.rate_type,
      amount: r.amount,
    }))
    const { error: rateErr } = await supabase.from('pricing_rules').insert(rulesToInsert)
    if (rateErr) console.error('Error inserting rate rules:', rateErr)
  }

  // 3. Insert Property Images
  if (property.image_urls && property.image_urls.length > 0) {
    const imagesToInsert = property.image_urls.map(url => ({
      property_id: prop.id,
      storage_path: url,
    }))
    const { error: imgErr } = await supabase.from('property_images').insert(imagesToInsert)
    if (imgErr) console.error('Error inserting property images:', imgErr)
  }

  return prop
}

export async function updatePropertyStatus(id: string, status: PropertyStatus) {
  const { data, error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) throw error
}
