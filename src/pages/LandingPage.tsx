import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { PropertyCard } from '../components/property/PropertyCard'
import { getApprovedProperties } from '../lib/queries/properties'
import { Property } from '../types/database'
import { Search, Building2, ShieldCheck, Sparkles, ArrowRight, Clock, MapPin, CheckCircle2, ArrowUpRight, CreditCard, LockKeyhole } from 'lucide-react'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])

  useEffect(() => {
    getApprovedProperties()
      .then((data) => {
        setFeaturedProperties(data.slice(0, 3))
      })
      .catch((err) => {
        console.error('Error fetching landing properties:', err)
      })
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/properties?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="pb-20 overflow-hidden">
      <section className="relative min-h-[680px] flex items-end overflow-hidden border-b border-[#262626]">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=88"
          alt="Luxury modern living space"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[#080809]/55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,9,0.9)_0%,rgba(8,8,9,0.3)_62%,rgba(8,8,9,0.45)_100%)]" />

        <div className="hero-light-text relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 md:pb-16">
          <div className="max-w-3xl space-y-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6672]">
              <Sparkles className="w-4 h-4" /> Curated spaces. Considered living.
            </div>
            <h1 className="max-w-3xl text-5xl sm:text-7xl font-extrabold leading-[0.98] tracking-tight text-white">
              Your next space should feel <span className="text-[#FF6672]">exceptional.</span>
            </h1>
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-zinc-200">
              Private residences, standout venues, and creative studios across Nepal, ready when your plans are.
            </p>

            <form onSubmit={handleSearchSubmit} className="max-w-2xl pt-1">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border border-white/20 bg-black/55 p-2 shadow-2xl backdrop-blur-md focus-within:border-[#FF6672]">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-[#FF6672]" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Kathmandu, Pokhara, Lalitpur..."
                    className="h-12 border-none bg-transparent pl-12 text-sm text-white placeholder:text-zinc-400 focus:ring-0"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 w-full sm:w-auto px-8">
                  Find a space <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="border-b border-[#262626] bg-[#141416]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#262626]">
          {[
            ['23+', 'verified spaces'],
            ['3', 'flexible rate types'],
            ['24/7', 'booking access'],
            ['100%', 'secure reservations'],
          ].map(([value, label]) => (
            <div key={label} className="px-5 py-6 md:px-8">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-20 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#FF6672]">
              <span className="h-px w-8 bg-[#E11D2E]" /> The edit
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Spaces worth making plans for</h2>
            <p className="mt-2 text-sm text-zinc-400">Handpicked places for weekends, launches, celebrations, and everything between.</p>
          </div>
          <Link to="/properties" className="flex items-center gap-2 text-sm font-semibold text-[#FF6672] hover:text-white transition-colors">
            Explore the collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} priority />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No properties available yet. Owners can list spaces now!</p>
          </Card>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-[#262626] bg-[#141416]">
            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85"
              alt="Elegant event venue prepared for a celebration"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6672]">Made for the moment</p>
              <p className="mt-2 max-w-sm text-2xl font-bold leading-tight text-white">A beautiful backdrop changes everything.</p>
            </div>
          </div>
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#FF6672]">
                <span className="h-px w-8 bg-[#E11D2E]" /> Find your setting
              </div>
              <h2 className="mt-3 max-w-md text-3xl font-bold tracking-tight text-white">Whatever the plan, start with the right place.</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">From a quiet Kathmandu base to a room that makes an entrance, every listing is selected to make your time count.</p>
            </div>
            <div className="divide-y divide-[#262626] border-y border-[#262626]">
              {[
                ['01', 'Homes for the weekend', 'Thoughtful residences for slowing down, settling in, and staying awhile.', 'flat'],
                ['02', 'Venues for your moment', 'Distinctive settings for celebrations, launches, and gatherings.', 'venue'],
                ['03', 'Studios for your next idea', 'Flexible creative rooms built for making, recording, and sharing.', 'studio'],
              ].map(([number, title, description, type]) => (
                <Link key={type} to={`/properties?type=${type}`} className="group flex items-start gap-4 py-5 transition-colors hover:bg-[#141416]">
                  <span className="pt-1 text-xs font-mono text-zinc-600">{number}</span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-3 font-semibold text-white">
                      {title}<ArrowUpRight className="h-4 w-4 text-[#FF6672] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-zinc-500">{description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-24">
        <div className="border-y border-[#262626] py-10 grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#FF6672]"><ShieldCheck className="h-4 w-4" /> Simple by design</div>
            <h2 className="mt-3 text-2xl font-bold text-white">A better way to book space.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              [Search, 'Discover', 'Search by place, type, and budget.'],
              [Clock, 'Choose your pace', 'Book hourly, daily, or monthly.'],
              [CheckCircle2, 'Arrive assured', 'Get clear confirmation and an invoice.'],
            ].map(([Icon, title, description], index) => (
              <div key={title as string} className="space-y-3">
                <div className="flex items-center gap-3 text-[#FF6672]"><span className="text-xs font-mono text-zinc-600">0{index + 1}</span><Icon className="h-5 w-5" /></div>
                <h3 className="font-semibold text-white">{title as string}</h3>
                <p className="text-xs leading-relaxed text-zinc-500">{description as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-24">
        <div className="rounded-2xl border border-[#D9CDBD] bg-[#FFFBF5] px-6 py-8 sm:px-10 sm:py-9 shadow-[0_16px_50px_rgba(80,65,45,0.08)]">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B18445]">
                <CreditCard className="h-4 w-4" /> We accept
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1B2923]">Pay your way, securely.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#66736B]">Complete your reservation with trusted Nepal payment methods. Your booking details stay protected from checkout to arrival.</p>
            </div>

            <div className="grid w-full max-w-2xl grid-cols-1 items-center gap-6 sm:grid-cols-3">
              <div className="flex items-center justify-center">
                <span className="flex h-14 w-[170px] max-w-full items-center justify-center rounded-lg bg-white px-3 py-2 shadow-[0_4px_14px_rgba(80,65,45,0.08)]">
                  <img src="/payments/esewa.png" alt="eSewa logo" className="max-h-full max-w-full object-contain" />
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="flex h-14 w-[170px] max-w-full items-center justify-center rounded-lg bg-white px-3 py-2 shadow-[0_4px_14px_rgba(80,65,45,0.08)]">
                  <img src="/payments/khalti.png" alt="Khalti logo" className="max-h-full max-w-full object-contain" />
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="flex h-14 w-[170px] max-w-full items-center justify-center rounded-lg bg-white px-3 py-2 shadow-[0_4px_14px_rgba(80,65,45,0.08)]">
                  <img src="/payments/connectips.png" alt="ConnectIPS logo" className="max-h-full max-w-full object-contain" />
                </span>
              </div>
            </div>
          </div>
          <div className="mt-7 flex items-center gap-2 border-t border-[#D9CDBD] pt-5 text-[11px] font-medium text-[#7E8982]">
            <LockKeyhole className="h-3.5 w-3.5 text-[#1F6B55]" /> Secure payment processing for every reservation
          </div>
        </div>
      </section>
    </div>
  )
}
