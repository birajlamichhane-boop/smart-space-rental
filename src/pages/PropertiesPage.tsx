import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PropertyCard } from '../components/property/PropertyCard'
import { PropertyFilters } from '../components/property/PropertyFilters'
import { getApprovedProperties } from '../lib/queries/properties'
import { Property, PropertyType } from '../types/database'
import { useAuth } from '../hooks/useAuth'
import { getCustomerWishlist, addToWishlist, removeFromWishlist } from '../lib/queries/wishlist'
import { Building2, SearchX } from 'lucide-react'
import { Card } from '../components/ui/card'

export const PropertiesPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const [type, setType] = useState<PropertyType | 'all'>('all')
  const [search, setSearch] = useState(initialSearch)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    fetchProperties()
    if (user) {
      fetchWishlist()
    }
  }, [type, search, minPrice, maxPrice, user])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const data = await getApprovedProperties({
        type,
        search,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      })
      setProperties(data)
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    if (!user) return
    try {
      const items = await getCustomerWishlist(user.id)
      setWishlistIds(new Set(items.map((i) => i.property_id)))
    } catch (err) {
      console.error('Error fetching wishlist:', err)
    }
  }

  const handleToggleWishlist = async (propertyId: string) => {
    if (!user) return
    const isSaved = wishlistIds.has(propertyId)
    const nextSet = new Set(wishlistIds)

    if (isSaved) {
      nextSet.delete(propertyId)
      setWishlistIds(nextSet)
      await removeFromWishlist(user.id, propertyId)
    } else {
      nextSet.add(propertyId)
      setWishlistIds(nextSet)
      await addToWishlist(user.id, propertyId)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Explore Rental Spaces</h1>
        <p className="text-sm text-zinc-400 mt-1">Browse flats, event venues, and studios available for rent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PropertyFilters
            type={type}
            setType={setType}
            search={search}
            setSearch={setSearch}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </div>

        {/* Property Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4, 5].map((i) => (
                <div key={i} className="h-80 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isWishlisted={wishlistIds.has(prop.id)}
                  onToggleWishlist={user ? handleToggleWishlist : undefined}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 space-y-3">
              <SearchX className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-semibold text-white">No properties found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No rental spaces match your search criteria. Try resetting filters or searching a different location.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
