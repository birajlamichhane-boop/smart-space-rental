import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Property } from '../../types/database'
import { MapPin, Heart, Star } from 'lucide-react'

interface PropertyCardProps {
  property: Property;
  isWishlisted?: boolean;
  onToggleWishlist?: (propertyId: string) => void;
  priority?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isWishlisted = false,
  onToggleWishlist,
  priority = false,
}) => {
  const primaryImage = property.images && property.images.length > 0
    ? property.images[0].storage_path
    : 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'

  const avgRating = property.reviews && property.reviews.length > 0
    ? (property.reviews.reduce((acc, r) => acc + r.rating, 0) / property.reviews.length).toFixed(1)
    : null

  return (
    <Card hoverable className="p-0 overflow-hidden group flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#1C1C1F]">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="neutral" className="bg-black/70 backdrop-blur-md uppercase text-[10px]">
              {property.type}
            </Badge>
            {property.status !== 'approved' && (
              <Badge variant={property.status}>
                {property.status}
              </Badge>
            )}
          </div>
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleWishlist(property.id)
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-[#E11D2E] text-[#E11D2E]' : 'text-zinc-300'}`}
              />
            </button>
          )}
        </div>

        {/* Info Content */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E11D2E]" />
              {property.location || 'Location upon request'}
            </span>
            {avgRating && (
              <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {avgRating} ({property.reviews?.length})
              </span>
            )}
          </div>

          <Link to={`/properties/${property.id}`} className="block group-hover:text-[#E11D2E] transition-colors">
            <h3 className="font-semibold text-lg text-white line-clamp-1">{property.title}</h3>
          </Link>

          <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {property.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="px-5 py-4 border-t border-[#262626] bg-[#0A0A0B]/40 flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-500 block">Starting from</span>
          <span className="text-lg font-bold text-white">
            रू {property.base_price.toLocaleString('en-NP')}
            <span className="text-xs text-zinc-400 font-normal"> / day</span>
          </span>
        </div>
        <Link
          to={`/properties/${property.id}`}
          className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#E11D2E] text-white hover:bg-[#FF2E44] transition-all shadow-[0_0_10px_rgba(225,29,46,0.3)]"
        >
          View Details
        </Link>
      </div>
    </Card>
  )
}
