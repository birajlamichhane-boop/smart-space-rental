import React, { useState, useEffect } from 'react'
import { getPendingProperties, updatePropertyStatus } from '../../lib/queries/properties'
import { Property } from '../../types/database'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { CheckSquare, Check, X, MapPin } from 'lucide-react'

export const PropertyApprovalsPage: React.FC = () => {
  const [pendingProperties, setPendingProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const data = await getPendingProperties()
      setPendingProperties(data)
    } catch (err) {
      console.error('Error fetching pending approvals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (propertyId: string, status: 'approved' | 'rejected') => {
    setActionId(propertyId)
    try {
      await updatePropertyStatus(propertyId, status)
      setPendingProperties(pendingProperties.filter((p) => p.id !== propertyId))
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-[#E11D2E]" /> Admin Property Approvals Queue
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Review submitted owner listings before publishing them on the public marketplace.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#0A0A0B] border-b border-[#262626] text-zinc-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Title & Type</th>
                <th className="px-6 py-4">Space Owner</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Base Daily Rate</th>
                <th className="px-6 py-4 text-right">Approve / Reject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="h-6 w-full skeleton-shimmer" />
                  </td>
                </tr>
              ) : pendingProperties.length > 0 ? (
                pendingProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-[#1C1C1F]/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <span className="text-sm block">{prop.title}</span>
                      <span className="text-[11px] text-zinc-400 uppercase">{prop.type}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {prop.owner?.full_name || 'Owner'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E11D2E]" /> {prop.location || 'Unspecified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white text-sm">
                      ${prop.base_price} / day
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          isLoading={actionId === prop.id}
                          onClick={() => handleAction(prop.id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={actionId === prop.id}
                          onClick={() => handleAction(prop.id, 'rejected')}
                          className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs px-3 py-1"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                    Great news! The pending approvals queue is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
