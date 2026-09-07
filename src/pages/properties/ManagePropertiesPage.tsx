import React, { useState, useEffect } from 'react'
import { getOwnerProperties, createProperty, deleteProperty } from '../../lib/queries/properties'
import { Property, PropertyType } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Dialog } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { PlusCircle, Building2, Trash2, MapPin, DollarSign, AlertCircle } from 'lucide-react'

export const ManagePropertiesPage: React.FC = () => {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [type, setType] = useState<PropertyType>('flat')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [monthlyRate, setMonthlyRate] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if (user) fetchProperties()
  }, [user])

  const fetchProperties = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getOwnerProperties(user.id)
      setProperties(data)
    } catch (err) {
      console.error('Error fetching owner properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setErrorMsg(null)

    if (!title || !basePrice) {
      setErrorMsg('Please fill in title and base daily price.')
      return
    }

    setSubmitting(true)
    try {
      const rates = [
        { rate_type: 'daily' as const, amount: parseFloat(basePrice) },
        ...(hourlyRate ? [{ rate_type: 'hourly' as const, amount: parseFloat(hourlyRate) }] : []),
        ...(monthlyRate ? [{ rate_type: 'monthly' as const, amount: parseFloat(monthlyRate) }] : []),
      ]

      const images = imageUrl ? [imageUrl] : [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
      ]

      await createProperty({
        owner_id: user.id,
        title,
        type,
        description,
        location,
        base_price: parseFloat(basePrice),
        rates,
        image_urls: images,
      })

      setIsModalOpen(false)
      resetForm()
      fetchProperties()
    } catch (err: any) {
      console.error('Error creating property:', err)
      setErrorMsg(err.message || 'Failed to submit property.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delist/delete this property?')) return
    try {
      await deleteProperty(id)
      setProperties(properties.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Error deleting property:', err)
    }
  }

  const resetForm = () => {
    setTitle('')
    setType('flat')
    setDescription('')
    setLocation('')
    setBasePrice('')
    setHourlyRate('')
    setMonthlyRate('')
    setImageUrl('')
  }

  const typeOptions = [
    { value: 'flat', label: 'Residential Flat' },
    { value: 'venue', label: 'Event Venue' },
    { value: 'studio', label: 'Retail Studio' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manage My Space Listings</h1>
          <p className="text-sm text-zinc-400 mt-1">Create, update, or delist your rental properties.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add New Property
        </Button>
      </div>

      {/* Property List Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#0A0A0B] border-b border-[#262626] text-zinc-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Title & Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Base Daily Rate</th>
                <th className="px-6 py-4">Approval Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="h-6 w-full skeleton-shimmer" />
                  </td>
                </tr>
              ) : properties.length > 0 ? (
                properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-[#1C1C1F]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white block text-sm">{prop.title}</span>
                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider">{prop.type}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E11D2E]" /> {prop.location || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white text-sm">
                      रू {prop.base_price.toLocaleString('en-NP')} / day
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={prop.status}>{prop.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(prop.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                    You haven't listed any properties yet. Click "Add New Property" above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Property Modal Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Rental Property"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateProperty} className="space-y-4">
          <Input
            label="Property Title"
            placeholder="e.g. Modern Downtown Studio Loft"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label="Space Category"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as PropertyType)}
          />

          <Input
            label="Location / Address"
            placeholder="e.g. Kupondole Road, Lalitpur"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Base Daily Rate (रू)"
              type="number"
              placeholder="150"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
            />
            <Input
              label="Hourly Rate (रू)"
              type="number"
              placeholder="25"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <Input
              label="Monthly Rate (रू)"
              type="number"
              placeholder="3500"
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight space amenities, capacity, accessibility..."
              className="w-full rounded-lg border border-[#262626] bg-[#141416] p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#E11D2E] focus:outline-none focus:ring-2 focus:ring-[#E11D2E]/60 focus:ring-offset-2 focus:ring-offset-[#0A0A0B]"
            />
          </div>

          <Input
            label="Cover Image Storage URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Submit Property
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
