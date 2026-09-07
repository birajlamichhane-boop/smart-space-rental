import React, { useState } from 'react'
import { PropertyImage } from '../../types/database'

interface PropertyGalleryProps {
  images?: PropertyImage[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const defaultPlaceholder = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  const imageUrls = images && images.length > 0
    ? images.map((img) => img.storage_path)
    : [defaultPlaceholder]

  const [activeImage, setActiveImage] = useState(imageUrls[0])

  return (
    <div className="space-y-4">
      {/* Main Feature Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#262626] bg-[#141416]">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Thumbnail Strip */}
      {imageUrls.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {imageUrls.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(url)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border transition-all ${
                activeImage === url
                  ? 'border-[#E11D2E] ring-2 ring-[#E11D2E]/50 scale-105'
                  : 'border-[#262626] opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
