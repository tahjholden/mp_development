import { Plus, Edit, Trash2, CheckCircle, Circle, Clock, Search, Filter, Target, Users, Zap, Lightbulb, Activity, TrendingUp } from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import UniversalCard from '@/components/ui/UniversalCard'
import { UniversalButton } from '@/components/ui/UniversalButton'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Types for development plans
interface DevelopmentPlan {
  id: string
  playerId: string
  playerName: string
  coachId: string
  coachName: string
  title: string
  objective: string
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
export default async function DevelopmentPlansPage() {
  const cookieStore = await cookies()
  const supabase = createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/sign-in')
  }

  // Mock drill suggestions - in real app, this would be AI-generated based on selected players
  const drillSuggestions: DrillSuggestion[] = [
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
  ]

  // Fetch data server-side
  let plans: DevelopmentPlan[] = []
  let players: Player[] = []
  let playerSkillTags: Record<string, string[]> = {}
  let allSkillTags: string[] = []

  try {
    // Fetch development plans
    const plansResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/development-plans`, {
      headers: {
        'Cookie': cookieStore.toString()
      }
    })
    if (plansResponse.ok) {
      plans = await plansResponse.json()
    }
    
    // Fetch players (today's attendance)
    const playersResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/players`, {
      headers: {
        'Cookie': cookieStore.toString()
      }
    })
    let playersData: any[] = [];
    if (playersResponse.ok) {
      playersData = await playersResponse.json()
      players = playersData.map((player: any) => ({
        id: player.id,
        name: player.name || `${player.firstName || ''} ${player.lastName || ''}`.trim() || 'Unknown Player',
        team: player.team_name || player.team || 'No Team',
        status: player.status || 'active',
        attendance: 'present' as const,
        pdpStatus: 'active' as const,
        topTags: [],
        readiness: 'medium' as const
      }))
    }

    // Fetch all skill tags for dropdowns, etc.
    try {
      const { data: skillTags, error: skillTagError } = await supabase
        .from('mpbc_skill_tag')
        .select('name')
        .order('name');
      if (!skillTagError && skillTags) {
        allSkillTags = skillTags.map((tag: any) => tag.name);
      }
    } catch (error) {
      console.warn('Skill tags table not available:', error);
    }

    // Fetch skill tags for each player
    const playerIds = playersData.map((p: any) => p.id);
    if (playerIds.length > 0) {
      try {
        // Batch playerIds into groups of 20
        const batchSize = 20;
        const batches = [];
        for (let i = 0; i < playerIds.length; i += batchSize) {
          batches.push(playerIds.slice(i, i + batchSize));
        }

        let allSkillChallenges: any[] = [];
        for (const batch of batches) {
          const { data: skillChallenges, error: skillChallengeError } = await supabase
            .from('mpbc_player_skill_challenge')
            .select('player_id, skill_tag_id, development_plan_id')
            .in('player_id', batch);

          if (!skillChallengeError && skillChallenges) {
            allSkillChallenges = allSkillChallenges.concat(skillChallenges);
          }
        }

        // Get all unique skill_tag_ids
        const skillTagIds = Array.from(new Set((allSkillChallenges || []).map((sc: any) => sc.skill_tag_id)));
        let skillTagMap: Record<string, string> = {};
        if (skillTagIds.length > 0) {
          const { data: skillTags, error: skillTagError } = await supabase
            .from('mpbc_skill_tag')
            .select('id, name')
            .in('id', skillTagIds);
          if (!skillTagError && skillTags) {
            skillTagMap = skillTags.reduce((acc: Record<string, string>, tag: any) => {
              acc[tag.id] = tag.name;
              return acc;
            }, {});
          }
        }

        // Map player_id to array of skill tag names
        (allSkillChallenges || []).forEach((sc: any) => {
          if (!playerSkillTags[sc.player_id]) playerSkillTags[sc.player_id] = [];
          if (skillTagMap[sc.skill_tag_id]) playerSkillTags[sc.player_id].push(skillTagMap[sc.skill_tag_id]);
        });
      } catch (error) {
        console.warn('Player skill challenges not available:', error);
      }
    }
  } catch (err) {
    console.error('Error fetching data:', err)
  }

  // For now, show all players and plans since this is server-side rendered
  const filteredPlayers = players
  const selectedPlayerPlans = plans

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
    // In real app, this would use AI to generate suggestions based on player needs
    return drillSuggestions
  }

  return (
    <div className="grid grid-cols-[320px_1fr_340px] gap-6 min-h-[calc(100vh-4rem)] px-6 py-6">
      {/* LEFT: Player List with Checkboxes */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#d8cc97] mt-0">Today's Players</h2>
          <div className="flex gap-2">
            <UniversalButton.Primary size="sm">
              Launch Session
            </UniversalButton.Primary>
          </div>
        </div>
        {/* Player List */}
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
                className="p-3 rounded-lg border bg-zinc-800/50 border-zinc-700"
              >
                <div className="flex items-start space-x-3">
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

      {/* CENTER: Active PDP Summary View */}
      <div>
        <div className="space-y-6">
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
          {selectedPlayerPlans.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center h-96">
              <Target className="text-zinc-700 w-20 h-20 mb-5" />
              <h3 className="text-lg font-medium text-white mb-2">No Development Plans Found</h3>
              <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                No development plans are currently available for the players.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedPlayerPlans.length > 0 ? (
                selectedPlayerPlans.map((plan) => (
                  <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#d8cc97]">{plan.title || 'Untitled Plan'}</h3>
                        <p className="text-sm text-zinc-300 mb-2">{plan.objective || 'No objective provided'}</p>
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

      {/* RIGHT: Drill Suggestions */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">Drill Suggestions</h2>
        {selectedPlayerPlans.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">No development plans available</p>
            <p className="text-xs text-zinc-500 mt-1">Drill suggestions will appear when plans are available</p>
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
                Showing drill suggestions based on available development plans
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
