'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ThreeColumnLayout } from '@/components/basketball/ThreeColumnLayout'
import { UniversalButton } from '@/components/ui/UniversalButton'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { UniversalModal } from '@/components/ui/UniversalModal'
import { PersonType, Capability } from '@/lib/db/role-logic'
import { currentUserHasCapability } from '@/lib/db/user-service'
import { BasketballRoleType } from '@/lib/db/basketball-roles'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Edit, Eye, Plus, Search, Star, Trash2, Filter, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

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

interface Player {
  id: string
  name: string
  teamId: string
  teamName: string
}

// Main component
export default function ObservationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for user role and permissions
  const [userRole, setUserRole] = useState<PersonType | null>(null)
  const [isCoach, setIsCoach] = useState(false)
  const [isPlayer, setIsPlayer] = useState(false)
  const [canCreateObservations, setCanCreateObservations] = useState(false)
  const [canEditObservations, setCanEditObservations] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for observations
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  
  // State for filters
  const [playerFilter, setPlayerFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // State for modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  
  // Fetch user role and permissions
  useEffect(() => {
    async function fetchUserRoleAndPermissions() {
      try {
        // Fetch current user data
        const response = await fetch('/api/user')
        if (!response.ok) throw new Error('Failed to fetch user data')
        
        const userData = await response.json()
        setUserRole(userData.primaryRole)
        
        // Check if user is a coach or player
        setIsCoach(userData.primaryRole === PersonType.COACH || 
                   userData.roles?.includes(PersonType.COACH))
        
        setIsPlayer(userData.primaryRole === PersonType.PLAYER)
        
        setCanCreateObservations(userData.isAdmin || userData.isSuperadmin || userData.primaryRole === PersonType.COACH)
        setCanEditObservations(userData.isAdmin || userData.isSuperadmin || userData.primaryRole === PersonType.COACH)
        
        // After permissions are set, fetch observations
        fetchObservations()
      } catch (err) {
        console.error('Error fetching user role:', err)
        setError('Failed to load user permissions')
        setLoading(false)
      }
    }
    
    fetchUserRoleAndPermissions()
  }, [])
  
  // Fetch observations based on user role
  async function fetchObservations() {
    try {
      setLoading(true)
      
      // Fetch players first (for filtering)
      const playersResponse = await fetch('/api/players')
      if (playersResponse.ok) {
        const playersData = await playersResponse.json()
        setPlayers(playersData)
      }
      
      // Fetch observations
      const observationsResponse = await fetch('/api/observations')
      if (observationsResponse.ok) {
        const observationsData = await observationsResponse.json()
        setObservations(observationsData)
        
        // If there are observations and none is selected, select the first one
        if (observationsData.length > 0 && !selectedObservation) {
          setSelectedObservation(observationsData[0])
        }
      } else {
        // Use mock data if API doesn't exist yet
        const mockObservations = [
          {
            id: '1',
            playerId: 'player-1',
            playerName: 'Andrew Hemschoot',
            coachId: 'coach-1',
            coachName: 'Tahj Holden',
            title: 'Shooting Form Analysis',
            description: 'Andrew showed excellent progress with his shooting form today. His elbow alignment has improved significantly.',
            type: 'practice',
            category: 'Shooting',
            rating: 4,
            date: '2025-06-24T00:00:00Z',
            tags: ['Shooting', 'Form', 'Improvement'],
            notes: 'Continue to work on follow-through and release point.',
            private: false,
            createdAt: '2025-06-24T15:30:00Z',
            updatedAt: '2025-06-24T15:30:00Z'
          },
          {
            id: '2',
            playerId: 'player-2',
            playerName: 'Ben Swersky',
            coachId: 'coach-1',
            coachName: 'Tahj Holden',
            title: 'Game Performance Review',
            description: 'Ben demonstrated excellent court vision during the scrimmage. Made several key passes.',
            type: 'game',
            category: 'Basketball IQ',
            rating: 5,
            date: '2025-06-23T00:00:00Z',
            tags: ['Passing', 'Court Vision', 'Decision Making'],
            notes: 'Defensive positioning needs work.',
            private: true,
            createdAt: '2025-06-23T18:45:00Z',
            updatedAt: '2025-06-23T18:45:00Z'
          }
        ]
        setObservations(mockObservations)
        if (mockObservations.length > 0) {
          setSelectedObservation(mockObservations[0])
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching observations:', err)
      setError('Failed to load observations')
      setLoading(false)
    }
  }
  
  // Filter observations based on selected filters
  const filteredObservations = observations.filter(obs => {
    // Filter by player
    if (playerFilter !== 'all' && obs.playerId !== playerFilter) {
      return false
    }
    
    // Filter by type
    if (typeFilter !== 'all' && obs.type !== typeFilter) {
      return false
    }
    
    // Filter by category
    if (categoryFilter !== 'all' && obs.category !== categoryFilter) {
      return false
    }
    
    // Filter by rating
    if (ratingFilter !== 'all' && obs.rating !== parseInt(ratingFilter)) {
      return false
    }
    
    // Filter by search query
    if (searchQuery && !obs.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !obs.playerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !obs.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    return true
  })
  
  // Get unique categories for filtering
  const uniqueCategories = Array.from(new Set(observations.map(obs => obs.category)))
  
  // Get rating stars component
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }
  
  // Get type badge color
  const getTypeBadge = (type: string) => {
    const colors = {
      practice: 'bg-blue-100 text-blue-800',
      game: 'bg-green-100 text-green-800',
      skill_development: 'bg-purple-100 text-purple-800',
      physical: 'bg-red-100 text-red-800',
      mental: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.other
  }
  
  // Left column content - Filters
  const leftColumn = (
    <div className="space-y-4">
      <UniversalCard>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search observations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Player filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Player</label>
              <Select
                value={playerFilter}
                onValueChange={setPlayerFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Type filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="skill_development">Skill Development</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="mental">Mental</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Category filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Rating filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Rating</label>
              <Select
                value={ratingFilter}
                onValueChange={setRatingFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </UniversalCard>
      
      {/* Actions */}
      {canCreateObservations && (
        <UniversalCard>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <UniversalButton 
              className="w-full"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Observation
            </UniversalButton>
          </div>
        </UniversalCard>
      )}
    </div>
  )
  
  // Middle column content - Observations list
  const middleColumn = (
    <div className="space-y-4">
      <UniversalCard>
        <div className="p-4">
          <h2 className="text-lg font-semibold">Observations</h2>
          <p className="text-sm text-gray-500 mb-4">
            {filteredObservations.length} {filteredObservations.length === 1 ? 'observation' : 'observations'} found
          </p>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-500">{error}</p>
              <UniversalButton 
                variant="outline" 
                className="mt-2"
                onClick={() => fetchObservations()}
              >
                Retry
              </UniversalButton>
            </div>
          ) : filteredObservations.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-gray-500 mb-4">No observations found</p>
              {canCreateObservations && (
                <UniversalButton onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Observation
                </UniversalButton>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredObservations.map(obs => (
                <UniversalCard 
                  key={obs.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    selectedObservation?.id === obs.id ? "border-primary" : ""
                  )}
                  onClick={() => setSelectedObservation(obs)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{obs.title}</h3>
                          {obs.private && <Eye className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{obs.playerName}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeBadge(obs.type)}>
                            {obs.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">{obs.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getRatingStars(obs.rating)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between text-xs text-gray-500">
                      <span>{format(new Date(obs.date), 'MMM d, yyyy')}</span>
                      <span>by {obs.coachName}</span>
                    </div>
                  </div>
                </UniversalCard>
              ))}
            </div>
          )}
        </div>
      </UniversalCard>
    </div>
  )
  
  // Right column content - Selected observation details
  const rightColumn = selectedObservation ? (
    <div className="space-y-4">
      <UniversalCard>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">{selectedObservation.title}</h2>
                {selectedObservation.private && <Eye className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Player: {selectedObservation.playerName} | Coach: {selectedObservation.coachName}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getTypeBadge(selectedObservation.type)}>
                  {selectedObservation.type.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-500">{selectedObservation.category}</span>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {getRatingStars(selectedObservation.rating)}
                <span className="text-sm text-gray-500 ml-2">({selectedObservation.rating}/5)</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {canEditObservations && (
                <>
                  <UniversalButton
                    size="sm"
                    variant="outline"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </UniversalButton>
                  
                  <UniversalButton
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </UniversalButton>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p>{format(new Date(selectedObservation.date), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p>{format(new Date(selectedObservation.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </UniversalCard>
      
      <UniversalCard>
        <div className="p-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm">{selectedObservation.description}</p>
        </div>
      </UniversalCard>
      
      {selectedObservation.notes && (
        <UniversalCard>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm">{selectedObservation.notes}</p>
          </div>
        </UniversalCard>
      )}
      
      {selectedObservation.tags.length > 0 && (
        <UniversalCard>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedObservation.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </UniversalCard>
      )}
    </div>
  ) : (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-gray-500">Select an observation to view details</p>
      </div>
    </div>
  )
  
  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Observations</h1>
            <p className="text-gray-500">Track player progress and development</p>
          </div>
        </div>
        
        <ThreeColumnLayout
          leftColumn={leftColumn}
          middleColumn={middleColumn}
          rightColumn={rightColumn}
        />
      </div>
    </>
  )
}
