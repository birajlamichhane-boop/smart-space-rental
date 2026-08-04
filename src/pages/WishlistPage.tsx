import React, { useState, useEffect } from 'react'
import { getCustomerWishlist, removeFromWishlist } from '../lib/queries/wishlist'
import { WishlistItem } from '../types/database'
import { useAuth } from '../hooks/useAuth'
import { PropertyCard } from '../components/property/PropertyCard'
import { Card } from '../components/ui/card'
import { Heart, HeartOff } from 'lucide-react'

export const WishlistPage: React.FC = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchWishlist()
  }, [user])

  const fetchWishlist = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getCustomerWishlist(user.id)
      setItems(data)
    } catch (err) {
      console.error('Error fetching wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (propertyId: string) => {
    if (!user) return
    try {
      await removeFromWishlist(user.id, propertyId)
      setItems(items.filter((i) => i.property_id !== propertyId))
    } catch (err) {
      console.error('Error removing from wishlist:', err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#E11D2E] fill-[#E11D2E]" /> Saved Wishlist Spaces
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Your favorite rental properties saved for quick access and booking.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            item.property && (
              <PropertyCard
                key={item.id}
                property={item.property}
                isWishlisted={true}
                onToggleWishlist={handleRemove}
              />
            )
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 space-y-3">
          <HeartOff className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Click the heart icon on any property card while exploring spaces to save it here.
          </p>
        </Card>
      )}
    </div>
  )
}
