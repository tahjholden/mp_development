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
import { CalendarIcon, CheckCircle, Circle, Clock, Edit, Plus, Search, Trash2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// Types for development plans
interface DevelopmentPlan {
  id: string
  playerId: string
  playerName: string
  coachId: string
  coachName: string
  title: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  startDate: string
  endDate: string
  goals: DevelopmentGoal[]
  createdAt: string
  updatedAt: string
}

interface DevelopmentGoal {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  targetDate: string
  completedDate?: string
}

interface Player {
  id: string
  name: string
  teamId: string
  teamName: string
}

// Main component
export default function DevelopmentPlansPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for user role and permissions
  const [userRole, setUserRole] = useState<PersonType | null>(null)
  const [isCoach, setIsCoach] = useState(false)
  const [isPlayer, setIsPlayer] = useState(false)
  const [canCreatePlans, setCanCreatePlans] = useState(false)
  const [canEditPlans, setCanEditPlans] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for development plans
  const [plans, setPlans] = useState<DevelopmentPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  
  // State for filters
  const [playerFilter, setPlayerFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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
        
        setCanCreatePlans(userData.isAdmin || userData.isSuperadmin || userData.primaryRole === PersonType.COACH)
        setCanEditPlans(userData.isAdmin || userData.isSuperadmin || userData.primaryRole === PersonType.COACH)
        
        // After permissions are set, fetch plans
        fetchDevelopmentPlans()
      } catch (err) {
        console.error('Error fetching user role:', err)
        setError('Failed to load user permissions')
        setLoading(false)
      }
    }
    
    fetchUserRoleAndPermissions()
  }, [])
  
  // Fetch development plans based on user role
  async function fetchDevelopmentPlans() {
    try {
      setLoading(true)
      
      // Fetch players first (for filtering)
      const playersResponse = await fetch('/api/players')
      if (playersResponse.ok) {
        const playersData = await playersResponse.json()
        setPlayers(playersData)
      }
      
      // Fetch development plans
      const plansResponse = await fetch('/api/development-plans')
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        setPlans(plansData)
        
        // If there are plans and none is selected, select the first one
        if (plansData.length > 0 && !selectedPlan) {
          setSelectedPlan(plansData[0])
        }
      } else {
        // Use mock data if API doesn't exist yet
        const mockPlans = [
          {
            id: '1',
            playerId: 'player-1',
            playerName: 'Andrew Hemschoot',
            coachId: 'coach-1',
            coachName: 'Tahj Holden',
            title: 'Shooting Form Improvement',
            description: 'Focus on improving shooting form with emphasis on elbow alignment and follow-through.',
            status: 'active',
            startDate: '2025-06-01T00:00:00Z',
            endDate: '2025-08-01T00:00:00Z',
            goals: [
              {
                id: 'goal-1',
                title: 'Elbow Alignment',
                description: 'Maintain proper elbow alignment during shot',
                status: 'in_progress',
                targetDate: '2025-06-15T00:00:00Z'
              },
              {
                id: 'goal-2',
                title: 'Follow-through',
                description: 'Hold follow-through until ball reaches basket',
                status: 'not_started',
                targetDate: '2025-07-01T00:00:00Z'
              }
            ],
            createdAt: '2025-05-30T10:00:00Z',
            updatedAt: '2025-05-30T10:00:00Z'
          }
        ]
        setPlans(mockPlans)
        if (mockPlans.length > 0) {
          setSelectedPlan(mockPlans[0])
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching development plans:', err)
      setError('Failed to load development plans')
      setLoading(false)
    }
  }
  
  // Filter plans based on selected filters
  const filteredPlans = plans.filter(plan => {
    // Filter by player
    if (playerFilter !== 'all' && plan.playerId !== playerFilter) {
      return false
    }
    
    // Filter by status
    if (statusFilter !== 'all' && plan.status !== statusFilter) {
      return false
    }
    
    // Filter by search query
    if (searchQuery && !plan.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !plan.playerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    return true
  })
  
  // Calculate plan progress
  const calculateProgress = (plan: DevelopmentPlan) => {
    if (plan.goals.length === 0) return 0
    const completedGoals = plan.goals.filter(goal => goal.status === 'completed').length
    return Math.round((completedGoals / plan.goals.length) * 100)
  }
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-200 text-gray-800'
    }
  }
  
  // Get goal status icon
  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Circle className="w-5 h-5 text-gray-400" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-amber-500" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
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
                  placeholder="Search plans..."
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
            
            {/* Status filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </UniversalCard>
      
      {/* Actions */}
      {canCreatePlans && (
        <UniversalCard>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <UniversalButton 
              className="w-full"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Development Plan
            </UniversalButton>
          </div>
        </UniversalCard>
      )}
    </div>
  )
  
  // Middle column content - Plans list
  const middleColumn = (
    <div className="space-y-4">
      <UniversalCard>
        <div className="p-4">
          <h2 className="text-lg font-semibold">Development Plans</h2>
          <p className="text-sm text-gray-500 mb-4">
            {filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'} found
          </p>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-500">{error}</p>
              <UniversalButton 
                variant="outline" 
                className="mt-2"
                onClick={() => fetchDevelopmentPlans()}
              >
                Retry
              </UniversalButton>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-gray-500 mb-4">No development plans found</p>
              {canCreatePlans && (
                <UniversalButton onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Development Plan
                </UniversalButton>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlans.map(plan => (
                <UniversalCard 
                  key={plan.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    selectedPlan?.id === plan.id ? "border-primary" : ""
                  )}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{plan.title}</h3>
                        <p className="text-sm text-gray-500">{plan.playerName}</p>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{calculateProgress(plan)}%</span>
                      </div>
                      <Progress value={calculateProgress(plan)} className="h-2" />
                    </div>
                    
                    <div className="mt-3 flex justify-between text-xs text-gray-500">
                      <span>Created: {format(new Date(plan.createdAt), 'MMM d, yyyy')}</span>
                      <span>Due: {format(new Date(plan.endDate), 'MMM d, yyyy')}</span>
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
  
  // Right column content - Selected plan details
  const rightColumn = selectedPlan ? (
    <div className="space-y-4">
      <UniversalCard>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">{selectedPlan.title}</h2>
              <p className="text-sm text-gray-500">
                Player: {selectedPlan.playerName} | Coach: {selectedPlan.coachName}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {canEditPlans && (
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
          
          <div className="mt-4">
            <Badge className={getStatusColor(selectedPlan.status)}>
              {selectedPlan.status.charAt(0).toUpperCase() + selectedPlan.status.slice(1)}
            </Badge>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Progress</span>
                <span>{calculateProgress(selectedPlan)}%</span>
              </div>
              <Progress value={calculateProgress(selectedPlan)} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Start Date</p>
                <p>{format(new Date(selectedPlan.startDate), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p>{format(new Date(selectedPlan.endDate), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p>{format(new Date(selectedPlan.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{format(new Date(selectedPlan.updatedAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
      </UniversalCard>
      
      <UniversalCard>
        <div className="p-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm">{selectedPlan.description}</p>
        </div>
      </UniversalCard>
      
      <UniversalCard>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Development Goals</h3>
          
          {selectedPlan.goals.length === 0 ? (
            <p className="text-sm text-gray-500">No goals defined for this plan.</p>
          ) : (
            <div className="space-y-4">
              {selectedPlan.goals.map(goal => (
                <div key={goal.id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getGoalStatusIcon(goal.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
                        {goal.completedDate && (
                          <span>Completed: {format(new Date(goal.completedDate), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </UniversalCard>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-gray-500">Select a development plan to view details</p>
      </div>
    </div>
  )
  
  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Development Plans</h1>
            <p className="text-gray-500">Create and manage player development plans</p>
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
