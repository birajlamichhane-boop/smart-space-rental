import React from 'react'
import { Input } from '../ui/input'
import { PropertyType } from '../../types/database'
import { Search, SlidersHorizontal } from 'lucide-react'

interface PropertyFiltersProps {
  type: PropertyType | 'all';
  setType: (type: PropertyType | 'all') => void;
  search: string;
  setSearch: (search: string) => void;
  minPrice: string;
  setMinPrice: (min: string) => void;
  maxPrice: string;
  setMaxPrice: (max: string) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  type,
  setType,
  search,
  setSearch,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) => {
  const types: { id: PropertyType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Spaces' },
    { id: 'flat', label: 'Residential Flats' },
    { id: 'venue', label: 'Event Venues' },
    { id: 'studio', label: 'Retail Studios' },
  ]

  return (
    <div className="rounded-xl border border-[#262626] bg-[#141416] p-5 space-y-5 shadow-lg">
      <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-[#262626]">
        <SlidersHorizontal className="w-4 h-4 text-[#E11D2E]" />
        <span>Filter Properties</span>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Search Keywords</label>
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location, title..."
            className="pl-9"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Property Type Pills */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2">Space Type</label>
        <div className="grid grid-cols-2 gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${
                type === t.id
                  ? 'border-[#E11D2E] bg-[#E11D2E]/10 text-[#E11D2E] font-semibold'
                  : 'border-[#262626] bg-[#0A0A0B] text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Price Range ($/day)</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
