import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { PropertyCard } from '../components/property/PropertyCard'
import { getApprovedProperties } from '../lib/queries/properties'
import { Property } from '../types/database'
import { Search, Building2, ShieldCheck, Sparkles, ArrowRight, Clock, Award } from 'lucide-react'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApprovedProperties()
      .then((data) => {
        setFeaturedProperties(data.slice(0, 3))
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching landing properties:', err)
        setLoading(false)
      })
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/properties?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 pb-16 text-center max-w-5xl mx-auto px-6">
        {/* Static Ambient Red Glow behind Hero */}
        <div className="ambient-glow -top-24 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E11D2E]/10 border border-[#E11D2E]/20 text-[#E11D2E] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Smart Rental Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Rent Extraordinary Spaces for <span className="text-[#E11D2E]">Living & Events</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal">
            Seamlessly book premium residential flats, iconic event venues, and creative retail studios with hourly, daily, or monthly pricing.
          </p>

          {/* Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl bg-[#141416] border border-[#262626] shadow-2xl focus-within:border-[#E11D2E]">
              <div className="relative w-full flex-1">
                <Search className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Where do you want to rent? (e.g. Downtown, Studio...)"
                  className="pl-11 border-none bg-transparent focus:ring-0 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto px-8">
                Search Spaces
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Properties Grid */}
      <section className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Approved Spaces</h2>
            <p className="text-sm text-zinc-400 mt-1">Explore our handpicked and verified listings ready for instant booking.</p>
          </div>
          <Link to="/properties" className="text-sm font-semibold text-[#E11D2E] hover:text-[#FF2E44] flex items-center gap-1">
            Browse All Spaces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No properties available yet. Owners can list spaces now!</p>
          </Card>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white tracking-tight">How SmartSpace Works</h2>
          <p className="text-sm text-zinc-400 mt-2">Effortless space reservation built for customers, staff, and space owners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E11D2E]/10 border border-[#E11D2E]/20 text-[#E11D2E] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">1. Discover & Filter</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Find the perfect flat, studio, or event venue using precise filters for location, type, and price range.
            </p>
          </Card>

          <Card className="text-center p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E11D2E]/10 border border-[#E11D2E]/20 text-[#E11D2E] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">2. Flexible Booking</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Choose hourly, daily, or monthly rates. Instant conflict detection guarantees zero double-booking.
            </p>
          </Card>

          <Card className="text-center p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E11D2E]/10 border border-[#E11D2E]/20 text-[#E11D2E] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">3. Confirmed & Invoiced</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Receive automatic confirmation and instant sequential invoice generation right in your dashboard.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
