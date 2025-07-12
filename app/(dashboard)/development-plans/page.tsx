'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Circle, Clock, Search, Filter, Target, Users, Zap, Lightbulb, Activity, TrendingUp } from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import UniversalCard from '@/components/ui/UniversalCard'
import { UniversalButton } from '@/components/ui/UniversalButton'
import { createClient } from '@/lib/supabase/server';

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
  tags: string[]
  readiness: 'high' | 'medium' | 'low'
  lastUpdated: string
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
  team: string
  status: 'active' | 'inactive'
  attendance: 'present' | 'absent' | 'unknown'
  pdpStatus: 'active' | 'stale' | 'updated'
  topTags: string[]
  readiness: 'high' | 'medium' | 'low'
}

interface DrillSuggestion {
  id: string
  name: string
  category: 'shooting' | 'ball_handling' | 'defense' | 'conditioning' | 'team_play'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // minutes
  description: string
  cues: string[]
  constraints: string[]
  players: number // min players needed
}

// Main component
export default function DevelopmentPlansPage() {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [playerSkillTags, setPlayerSkillTags] = useState<Record<string, string[]>>({});
  const [allSkillTags, setAllSkillTags] = useState<string[]>([]); // For sample skills dropdowns, etc.
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false)

  // Mock drill suggestions - in real app, this would be AI-generated based on selected players
  const [drillSuggestions, setDrillSuggestions] = useState<DrillSuggestion[]>([
    {
      id: '1',
      name: '3-Point Shooting Progression',
      category: 'shooting',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Progressive shooting drill focusing on form and accuracy',
      cues: ['Follow through', 'Square shoulders', 'Bend knees'],
      constraints: ['Must make 3 in a row', 'No dribbling'],
      players: 2
    },
    {
      id: '2',
      name: 'Ball Handling Circuit',
      category: 'ball_handling',
      difficulty: 'beginner',
      duration: 15,
      description: 'Station-based ball handling improvement',
      cues: ['Keep head up', 'Finger tips', 'Low stance'],
      constraints: ['No looking down', 'Speed variations'],
      players: 1
    },
    {
      id: '3',
      name: 'Defensive Slides',
      category: 'defense',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Defensive footwork and positioning',
      cues: ['Stay low', 'Active hands', 'Slide don\'t cross'],
      constraints: ['Maintain stance', 'No crossing feet'],
      players: 2
    }
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch development plans
        const plansResponse = await fetch('/api/development-plans')
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch development plans')
        }
        const plansData = await plansResponse.json()
        setPlans(plansData)
        
        // Fetch players (today's attendance)
        const playersResponse = await fetch('/api/dashboard/players')
        let playersData: any[] = [];
        if (playersResponse.ok) {
          playersData = await playersResponse.json()
          const transformedPlayers = playersData.map((player: any) => ({
            id: player.id,
            name: player.name || `${player.firstName || ''} ${player.lastName || ''}`.trim() || 'Unknown Player',
            team: player.team_name || player.team || 'No Team',
            status: player.status || 'active',
            attendance: 'present' as const, // In real app, this would come from attendance API
            pdpStatus: 'active' as const, // In real app, this would be calculated
            topTags: [], // Will be filled in below
            readiness: 'medium' as const // In real app, this would be calculated
          }))
          setPlayers(transformedPlayers)
        }

        // Fetch all skill tags for dropdowns, etc.
        const supabase = createClient();
        const { data: skillTags, error: skillTagError } = await supabase
          .from('mpbc_skill_tag')
          .select('name')
          .order('name');
        if (skillTagError) {
          throw new Error('Failed to fetch all skill tags');
        }
        setAllSkillTags((skillTags || []).map((tag: any) => tag.name));

        // Fetch skill tags for each player (using development_plan_id)
        const playerIds = playersData.map((p: any) => p.id);
        if (playerIds.length > 0) {
          // Get all skill challenges for these players
          const { data: skillChallenges, error: skillChallengeError } = await supabase
            .from('mpbc_player_skill_challenge')
            .select('player_id, skill_tag_id, development_plan_id')
            .in('player_id', playerIds);

          if (skillChallengeError) {
            throw new Error('Failed to fetch player skill challenges');
          }

          // Get all unique skill_tag_ids
          const skillTagIds = Array.from(new Set((skillChallenges || []).map((sc: any) => sc.skill_tag_id)));
          let skillTagMap: Record<string, string> = {};
          if (skillTagIds.length > 0) {
            const { data: skillTags, error: skillTagError } = await supabase
              .from('mpbc_skill_tag')
              .select('id, name')
              .in('id', skillTagIds);
            if (skillTagError) {
              throw new Error('Failed to fetch skill tag names');
            }
            skillTagMap = (skillTags || []).reduce((acc: Record<string, string>, tag: any) => {
              acc[tag.id] = tag.name;
              return acc;
            }, {});
          }

          // Map player_id to array of skill tag names
          const playerSkillTagsMap: Record<string, string[]> = {};
          (skillChallenges || []).forEach((sc: any) => {
            if (!playerSkillTagsMap[sc.player_id]) playerSkillTagsMap[sc.player_id] = [];
            if (skillTagMap[sc.skill_tag_id]) playerSkillTagsMap[sc.player_id].push(skillTagMap[sc.skill_tag_id]);
          });
          setPlayerSkillTags(playerSkillTagsMap);
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setPlans([])
        setPlayers([])
        setPlayerSkillTags({})
        setAllSkillTags([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter players based on search and team filter
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter
    return matchesSearch && matchesTeam
  })

  // Handle player selection (multi-select)
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  // Get selected players' plans
  const selectedPlayerPlans = plans.filter(plan => 
    selectedPlayers.includes(plan.playerId)
  )

  // Get readiness color
  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'high': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Get PDP status color
  const getPDPStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'updated': return 'bg-blue-500'
      case 'stale': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  // Get drill suggestions based on selected players
  const getFilteredDrillSuggestions = () => {
    if (selectedPlayers.length === 0) return []
    
    // In real app, this would use AI to generate suggestions based on player needs
    return drillSuggestions.filter(drill => drill.players <= selectedPlayers.length)
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
        {/* LEFT PANE: Player List with Checkboxes */}
        <div className="w-80 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#d8cc97] mt-0">Today's Players</h2>
            <div className="flex gap-2">
              <UniversalButton.Primary size="sm" disabled={selectedPlayers.length === 0}>
                Launch Session
              </UniversalButton.Primary>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>

          {/* Team Filter */}
          <div className="relative mb-6">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <div className="relative">
              <button
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm text-white border border-zinc-700 focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
              >
                <span>{teamFilter === 'all' ? 'All Teams' : teamFilter}</span>
                <span className="text-zinc-400">▼</span>
              </button>
              
              {isTeamDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setTeamFilter('all');
                      setIsTeamDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700"
                  >
                    All Teams
                  </button>
                  {Array.from(new Set(players.map(p => p.team))).map((team) => (
                    <button
                      key={team}
                      onClick={() => {
                        setTeamFilter(team);
                        setIsTeamDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700"
                    >
                      {team}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player List with Checkboxes */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No players found</p>
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedPlayers.includes(player.id)
                      ? 'bg-[#d8cc97]/20 border-[#d8cc97]'
                      : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                  }`}
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => handlePlayerSelect(player.id)}
                      className="mt-1 h-4 w-4 text-[#d8cc97] bg-zinc-800 border-zinc-600 rounded focus:ring-[#d8cc97] focus:ring-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-white text-sm truncate">{player.name}</p>
                        <div className="flex items-center space-x-1">
                          {/* Readiness indicator */}
                          <div className={`w-2 h-2 rounded-full ${getReadinessColor(player.readiness)}`} />
                          {/* PDP status indicator */}
                          <div className={`w-2 h-2 rounded-full ${getPDPStatusColor(player.pdpStatus)}`} />
                        </div>
                      </div>
                      
                      <p className="text-xs text-zinc-400 mb-2">{player.team}</p>
                      
                      {/* Top skill tags */}
                      <div className="flex flex-wrap gap-1">
                        {(playerSkillTags[player.id] || []).slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-zinc-700 text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MIDDLE PANE: Active PDP Summary View */}
        <div className="flex-1 p-6 bg-black">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#d8cc97]">Active PDP Summary</h2>
              <div className="flex gap-2">
                <UniversalButton.Secondary size="sm">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Plans
                </UniversalButton.Secondary>
                <UniversalButton.Primary size="sm">
                  Export Plan
                </UniversalButton.Primary>
              </div>
            </div>

            {selectedPlayers.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center h-96">
                <Target className="text-zinc-700 w-20 h-20 mb-5" />
                <h3 className="text-lg font-medium text-white mb-2">Select Players to View PDPs</h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                  Choose one or more players from the list to view their development plans and create session ideas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPlayerPlans.length > 0 ? (
                  selectedPlayerPlans.map((plan) => (
                    <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[#d8cc97]">{plan.title}</h3>
                          <p className="text-sm text-zinc-400">Player: {plan.playerName}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            plan.status === 'active' ? 'bg-green-500/20 text-green-500' :
                            plan.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getReadinessColor(plan.readiness)}`} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Focus Areas</h4>
                          <div className="flex flex-wrap gap-2">
                            {plan.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-zinc-800 text-zinc-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Active Goals</h4>
                          <div className="space-y-2">
                            {plan.goals.filter(g => g.status !== 'completed').slice(0, 3).map((goal) => (
                              <div key={goal.id} className="flex items-center space-x-2 p-2 bg-zinc-800/50 rounded">
                                {getGoalStatusIcon(goal.status)}
                                <span className="text-sm text-white">{goal.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                    <Target className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">No development plans found for selected players</p>
                    <p className="text-sm text-zinc-500">Create development plans to track player progress</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Drill Suggestions */}
        <div className="w-96 border-l border-zinc-800 p-6 bg-black flex flex-col min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">Drill Suggestions</h2>
          
          {selectedPlayers.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Select player(s) to see drill suggestions</p>
              <p className="text-xs text-zinc-500 mt-1">Based on their development needs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Smart Logic Header */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="text-[#d8cc97] w-4 h-4" />
                  <h4 className="font-medium text-white">Smart Suggestions</h4>
                </div>
                <p className="text-xs text-zinc-400">
                  {selectedPlayers.length === 1 
                    ? 'Individual plan + suggested cues/constraints'
                    : `${selectedPlayers.length} players selected - showing grouped constraint areas and SSG options`
                  }
                </p>
              </div>

              {/* Drill Suggestions */}
              <div className="space-y-3">
                {getFilteredDrillSuggestions().map((drill) => (
                  <div key={drill.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white text-sm">{drill.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        drill.difficulty === 'beginner' ? 'bg-green-500/20 text-green-500' :
                        drill.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {drill.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 mb-3">{drill.description}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <h5 className="text-xs font-medium text-zinc-500 mb-1">Cues</h5>
                        <div className="flex flex-wrap gap-1">
                          {drill.cues.map((cue, index) => (
                            <span key={index} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                              {cue}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium text-zinc-500 mb-1">Constraints</h5>
                        <div className="flex flex-wrap gap-1">
                          {drill.constraints.map((constraint, index) => (
                            <span key={index} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                              {constraint}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
                        <span className="text-xs text-zinc-500">{drill.duration} min</span>
                        <span className="text-xs text-zinc-500">{drill.players} player{drill.players !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function for goal status icons
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
