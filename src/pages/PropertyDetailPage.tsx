import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPropertyById } from '../lib/queries/properties'
import { getPropertyReviews, createReview } from '../lib/queries/reviews'
import { Property, Review } from '../types/database'
import { PropertyGallery } from '../components/property/PropertyGallery'
import { BookingCalendar } from '../components/booking/BookingCalendar'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../hooks/useAuth'
import { MapPin, Star, User, MessageSquare, Building, Calendar, CheckCircle2 } from 'lucide-react'

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [property, setProperty] = useState<Property | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // New review form
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (id) {
      fetchData(id)
    }
  }, [id])

  const fetchData = async (propId: string) => {
    setLoading(true)
    try {
      const prop = await getPropertyById(propId)
      setProperty(prop)
      if (prop) {
        const revs = await getPropertyReviews(propId)
        setReviews(revs)
      }
    } catch (err) {
      console.error('Error fetching property detail:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

    setSubmittingReview(true)
    try {
      const newRev = await createReview({
        property_id: id,
        customer_id: user.id,
        rating,
        comment,
      })
      setReviews([newRev, ...reviews])
      setComment('')
      setRating(5)
    } catch (err) {
      console.error('Error adding review:', err)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <div className="h-96 rounded-xl skeleton-shimmer" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-40 rounded-xl skeleton-shimmer" />
          <div className="h-40 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Property Not Found</h2>
        <p className="text-zinc-400 text-sm">The property you requested does not exist or was removed.</p>
      </div>
    )
  }

  const hourlyRate = property.pricing_rules?.find((r) => r.rate_type === 'hourly')?.amount ?? Math.round(property.base_price / 8)
  const dailyRate = property.pricing_rules?.find((r) => r.rate_type === 'daily')?.amount ?? property.base_price
  const monthlyRate = property.pricing_rules?.find((r) => r.rate_type === 'monthly')?.amount ?? property.base_price * 25

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neutral" className="uppercase text-xs font-semibold">
              {property.type}
            </Badge>
            <Badge variant={property.status}>
              {property.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{property.title}</h1>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#E11D2E]" />
            {property.location || 'Location details available upon reservation'}
          </p>
        </div>
        <div className="text-right hidden md:block">
          <span className="text-xs text-zinc-500 block font-medium">Starting Rate</span>
          <span className="text-3xl font-bold text-white">${dailyRate}<span className="text-sm font-normal text-zinc-400"> / day</span></span>
        </div>
      </div>

      {/* Gallery & Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Gallery & Info */}
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery images={property.images} title={property.title} />

          {/* Description Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-[#E11D2E]" /> About This Space
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {property.description || 'No detailed description available.'}
            </p>
          </Card>

          {/* Dynamic Pricing Rate Table */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E11D2E]" /> Dynamic Rate Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#0A0A0B] border border-[#262626] text-center">
                <span className="text-xs text-zinc-400 block font-medium">Hourly Rate</span>
                <span className="text-xl font-bold text-white mt-1 block">${hourlyRate}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#E11D2E]/10 border border-[#E11D2E]/30 text-center">
                <span className="text-xs text-[#E11D2E] block font-semibold">Daily Rate</span>
                <span className="text-xl font-bold text-white mt-1 block">${dailyRate}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0B] border border-[#262626] text-center">
                <span className="text-xs text-zinc-400 block font-medium">Monthly Rate</span>
                <span className="text-xl font-bold text-white mt-1 block">${monthlyRate}</span>
              </div>
            </div>
          </Card>

          {/* Reviews Section */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> Reviews ({reviews.length})
              </h3>
            </div>

            {/* Submit Review Form (for logged in users) */}
            {user && (
              <form onSubmit={handleAddReview} className="p-4 rounded-lg bg-[#0A0A0B] border border-[#262626] space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">Leave a Review</span>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-400">Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-[#141416] border border-[#262626] rounded px-2 py-1 text-xs text-white"
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience renting this space..."
                />
                <Button type="submit" size="sm" isLoading={submittingReview}>
                  Submit Review
                </Button>
              </form>
            )}

            {/* Review List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-lg bg-[#0A0A0B] border border-[#262626] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        {rev.customer?.full_name || 'Verified Renter'}
                      </span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {rev.rating} / 5
                      </span>
                    </div>
                    {rev.comment && <p className="text-xs text-zinc-300">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No reviews yet for this space.</p>
            )}
          </Card>
        </div>

        {/* Right Column - Booking Widget */}
        <div className="lg:col-span-1">
          <BookingCalendar property={property} />
        </div>
      </div>
    </div>
  )
}
