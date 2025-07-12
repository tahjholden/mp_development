'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import UniversalCard from '@/components/ui/UniversalCard'
import { UniversalButton } from '@/components/ui/UniversalButton'
import { Plus, Edit, Trash2, CheckCircle, Circle, Clock } from 'lucide-react'

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

// Main component
export default function DevelopmentPlansPage() {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDevelopmentPlans = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/development-plans')
        if (!response.ok) {
          throw new Error('Failed to fetch development plans')
        }
        
        const data = await response.json()
        setPlans(data)
        
        if (data.length > 0) {
          setSelectedPlan(data[0])
        }
      } catch (err) {
        console.error('Error fetching development plans:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch development plans')
        setPlans([])
      } finally {
        setLoading(false)
      }
    }

    fetchDevelopmentPlans()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/20'
      case 'completed':
        return 'text-blue-500 bg-blue-500/20'
      case 'draft':
        return 'text-yellow-500 bg-yellow-500/20'
      case 'archived':
        return 'text-gray-500 bg-gray-500/20'
      default:
        return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'not_started':
        return <Circle className="h-4 w-4 text-gray-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Development Plans">
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
      <DashboardLayout title="Development Plans">
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
    <DashboardLayout title="Development Plans">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Development Plans</h1>
          <UniversalButton.Primary>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </UniversalButton.Primary>
        </div>

        {/* Plans List */}
        {plans.length === 0 ? (
          <UniversalCard.Default>
            <div className="text-center py-8">
              <p className="text-zinc-400 mb-4">No development plans found.</p>
              <p className="text-zinc-500 text-sm">Create your first development plan to get started.</p>
            </div>
          </UniversalCard.Default>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <UniversalCard.Default
                key={plan.id}
                title={plan.title}
                subtitle={`Player: ${plan.playerName}`}
                className={`cursor-pointer transition-all hover:bg-zinc-800/50 ${
                  selectedPlan?.id === plan.id ? 'ring-2 ring-gold-500' : ''
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="space-y-4">
                  <p className="text-zinc-400 text-sm">{plan.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                    
                    <div className="flex gap-2">
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
                </div>
              </UniversalCard.Default>
            ))}
          </div>
        )}

        {/* Selected Plan Details */}
        {selectedPlan && (
          <UniversalCard.Default title="Plan Details">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Player</h4>
                  <p className="text-white">{selectedPlan.playerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Coach</h4>
                  <p className="text-white">{selectedPlan.coachName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Start Date</h4>
                  <p className="text-white">{new Date(selectedPlan.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">End Date</h4>
                  <p className="text-white">{new Date(selectedPlan.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Goals</h4>
                <div className="space-y-3">
                  {selectedPlan.goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getGoalStatusIcon(goal.status)}
                        <div>
                          <p className="text-white font-medium">{goal.title}</p>
                          <p className="text-zinc-400 text-sm">{goal.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Due: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </UniversalCard.Default>
        )}
      </div>
    </DashboardLayout>
  )
}
