'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Circle, Clock, Search, Filter, Target } from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import UniversalCard from '@/components/ui/UniversalCard'
import { UniversalButton } from '@/components/ui/UniversalButton'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)

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

  // Filter plans based on search and status
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.playerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
      <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
        {/* Header - exact replica with coach info */}
        <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
          <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
            MP Player Development
          </span>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-white leading-tight">Coach</span>
            <span className="text-xs text-[#d8cc97] leading-tight">coach@example.com</span>
            <span className="text-xs text-white leading-tight">Coach</span>
          </div>
        </header>
        
        {/* Sidebar */}
        <Sidebar 
          user={{
            name: "Coach",
            email: "coach@example.com", 
            role: "Coach"
          }}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-[#d8cc97] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-400">Loading development plans...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
        {/* Header - exact replica with coach info */}
        <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
          <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
            MP Player Development
          </span>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-white leading-tight">Coach</span>
            <span className="text-xs text-[#d8cc97] leading-tight">coach@example.com</span>
            <span className="text-xs text-white leading-tight">Coach</span>
          </div>
        </header>
        
        {/* Sidebar */}
        <Sidebar 
          user={{
            name: "Coach",
            email: "coach@example.com", 
            role: "Coach"
          }}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
      {/* Header - exact replica with coach info */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
        <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">Coach</span>
          <span className="text-xs text-[#d8cc97] leading-tight">coach@example.com</span>
          <span className="text-xs text-white leading-tight">Coach</span>
        </div>
      </header>
      
      {/* Sidebar */}
      <Sidebar 
        user={{
          name: "Coach",
          email: "coach@example.com", 
          role: "Coach"
        }}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
        {/* LEFT PANE: Plans List */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#d8cc97] mt-0">Development Plans</h2>
            <UniversalButton.Primary
              size="sm"
              leftIcon={<Plus size={16} />}
            >
              Create Plan
            </UniversalButton.Primary>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative mb-6">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm text-white border border-zinc-700 focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
              >
                <span>{statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                <span className="text-zinc-400">▼</span>
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setIsStatusDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700"
                  >
                    All Status
                  </button>
                  {['draft', 'active', 'completed', 'archived'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Plans List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-8">
                <Target className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No development plans found</p>
                <p className="text-xs text-zinc-500 mt-1">Create your first plan to get started</p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'bg-[#d8cc97]/20 border border-[#d8cc97]'
                      : 'bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white text-sm">{plan.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(plan.status)}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{plan.playerName}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2">{plan.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MIDDLE PANE: Plan Details */}
        <div className="flex-1 p-6 bg-black">
          {selectedPlan ? (
            <div className="space-y-6">
              {/* Plan Header */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#d8cc97]">{selectedPlan.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">Player: {selectedPlan.playerName}</p>
                  </div>
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
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Coach</h4>
                      <p className="text-white">{selectedPlan.coachName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Status</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPlan.status)}`}>
                        {selectedPlan.status.charAt(0).toUpperCase() + selectedPlan.status.slice(1)}
                      </span>
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
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Description</h4>
                    <p className="text-white">{selectedPlan.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Goals Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#d8cc97]">Goals</h3>
                  <UniversalButton.Primary size="sm">
                    Add Goal
                  </UniversalButton.Primary>
                </div>
                
                <div className="space-y-3">
                  {selectedPlan.goals.length > 0 ? (
                    selectedPlan.goals.map((goal) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Target className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                      <p className="text-zinc-400 mb-2">No goals created yet</p>
                      <p className="text-sm text-zinc-500">Add goals to track progress</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center h-full">
              <Target className="text-zinc-700 w-20 h-20 mb-5" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Plan to View Details</h3>
              <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">Select a development plan from the list to view its details and goals.</p>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Plan Progress */}
        <div className="w-1/3 border-l border-zinc-800 p-6 bg-black flex flex-col min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">Plan Progress</h2>
          
          {selectedPlan ? (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Total Goals</span>
                    <span className="text-white">{selectedPlan.goals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Completed</span>
                    <span className="text-white">
                      {selectedPlan.goals.filter(g => g.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">In Progress</span>
                    <span className="text-white">
                      {selectedPlan.goals.filter(g => g.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Not Started</span>
                    <span className="text-white">
                      {selectedPlan.goals.filter(g => g.status === 'not_started').length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Recent Activity</h4>
                <div className="text-center py-4">
                  <Clock className="text-zinc-700 w-8 h-8 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">No recent activity</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Select a plan to view progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
