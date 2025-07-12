'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import UniversalCard from '@/components/ui/UniversalCard'
import { UniversalButton } from '@/components/ui/UniversalButton'
import { Plus, Edit, Eye, Trash2, Star, Tag } from 'lucide-react'

// Types for observations
interface Observation {
  id: string
  playerId: string
  playerName: string
  coachId: string
  coachName: string
  title: string
  description: string
  type: 'practice' | 'game' | 'skill_development' | 'physical' | 'mental' | 'other'
  category: string
  rating: number
  date: string
  tags: string[]
  notes: string
  private: boolean
  createdAt: string
  updatedAt: string
}

// Main component
export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/observations')
        if (!response.ok) {
          throw new Error('Failed to fetch observations')
        }
        
        const data = await response.json()
        setObservations(data)
        
        if (data.length > 0) {
          setSelectedObservation(data[0])
        }
      } catch (err) {
        console.error('Error fetching observations:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch observations')
        setObservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchObservations()
  }, [])

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-zinc-600'}`}
      />
    ))
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      practice: 'text-blue-500 bg-blue-500/20',
      game: 'text-green-500 bg-green-500/20',
      skill_development: 'text-purple-500 bg-purple-500/20',
      physical: 'text-orange-500 bg-orange-500/20',
      mental: 'text-pink-500 bg-pink-500/20',
      other: 'text-gray-500 bg-gray-500/20'
    }
    return typeColors[type as keyof typeof typeColors] || typeColors.other
  }

  if (loading) {
    return (
      <DashboardLayout title="Observations">
        <div className="space-y-6">
          <UniversalCard.Default>
            <div className="animate-pulse">
              <div className="h-4 bg-zinc-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
            </div>
          </UniversalCard.Default>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Observations">
        <div className="space-y-6">
          <UniversalCard.Default>
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <UniversalButton.Primary onClick={() => window.location.reload()}>
                Try Again
              </UniversalButton.Primary>
            </div>
          </UniversalCard.Default>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Observations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Observations</h1>
          <UniversalButton.Primary>
            <Plus className="h-4 w-4 mr-2" />
            Create New Observation
          </UniversalButton.Primary>
        </div>

        {/* Observations List */}
        {observations.length === 0 ? (
          <UniversalCard.Default>
            <div className="text-center py-8">
              <p className="text-zinc-400 mb-4">No observations found.</p>
              <p className="text-zinc-500 text-sm">Create your first observation to get started.</p>
            </div>
          </UniversalCard.Default>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {observations.map((observation) => (
              <UniversalCard.Default
                key={observation.id}
                title={observation.title}
                subtitle={`Player: ${observation.playerName}`}
                className={`cursor-pointer transition-all hover:bg-zinc-800/50 ${
                  selectedObservation?.id === observation.id ? 'ring-2 ring-gold-500' : ''
                }`}
                onClick={() => setSelectedObservation(observation)}
              >
                <div className="space-y-4">
                  <p className="text-zinc-400 text-sm">{observation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(observation.type)}`}>
                        {observation.type.charAt(0).toUpperCase() + observation.type.slice(1)}
                      </span>
                      {observation.private && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-500 bg-red-500/20">
                          Private
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <UniversalButton.Secondary size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </UniversalButton.Secondary>
                      <UniversalButton.Secondary size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </UniversalButton.Secondary>
                      <UniversalButton.Danger size="sm">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </UniversalButton.Danger>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getRatingStars(observation.rating)}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {new Date(observation.date).toLocaleDateString()}
                    </span>
                  </div>

                  {observation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {observation.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-zinc-400 bg-zinc-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </UniversalCard.Default>
            ))}
          </div>
        )}

        {/* Selected Observation Details */}
        {selectedObservation && (
          <UniversalCard.Default title="Observation Details">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Player</h4>
                  <p className="text-white">{selectedObservation.playerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Coach</h4>
                  <p className="text-white">{selectedObservation.coachName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Type</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(selectedObservation.type)}`}>
                    {selectedObservation.type.charAt(0).toUpperCase() + selectedObservation.type.slice(1)}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Category</h4>
                  <p className="text-white">{selectedObservation.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Date</h4>
                  <p className="text-white">{new Date(selectedObservation.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Rating</h4>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(selectedObservation.rating)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Description</h4>
                <p className="text-white">{selectedObservation.description}</p>
              </div>

              {selectedObservation.notes && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Notes</h4>
                  <p className="text-white">{selectedObservation.notes}</p>
                </div>
              )}

              {selectedObservation.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedObservation.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-zinc-400 bg-zinc-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </UniversalCard.Default>
        )}
      </div>
    </DashboardLayout>
  )
}
