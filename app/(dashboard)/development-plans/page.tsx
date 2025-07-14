'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Circle, Clock, Search, Filter, Target, Users, Zap, Lightbulb, Activity, TrendingUp, Shield } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import UniversalCard from '@/components/ui/UniversalCard';
import { UniversalButton } from '@/components/ui/UniversalButton';
import PlayerListCard from '@/components/basketball/PlayerListCard';
import PlayersList from '@/components/basketball/PlayersList';
import type { Player as SharedPlayer, PlayerStatus } from '@/components/basketball/PlayerListCard';
import { z } from 'zod';

// Zod schemas for validation
const DevelopmentGoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  targetDate: z.string(),
  completedDate: z.string().optional(),
});

const DevelopmentPlanSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  playerName: z.string(),
  coachId: z.string(),
  coachName: z.string(),
  title: z.string(),
  objective: z.string(),
  description: z.string(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  startDate: z.string(),
  endDate: z.string(),
  goals: z.array(DevelopmentGoalSchema),
  tags: z.array(z.string()),
  readiness: z.enum(['high', 'medium', 'low']),
  lastUpdated: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const DevelopmentPlansArraySchema = z.array(DevelopmentPlanSchema);

// Types for development plans
interface DevelopmentPlan {
  id: string;
  playerId: string;
  playerName: string;
  coachId: string;
  coachName: string;
  title: string;
  objective: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  goals: DevelopmentGoal[];
  tags: string[];
  readiness: 'high' | 'medium' | 'low';
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

interface DevelopmentGoal {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  targetDate: string;
  completedDate?: string;
}

interface DrillSuggestion {
  id: string;
  name: string;
  category: 'shooting' | 'ball_handling' | 'defense' | 'conditioning' | 'team_play';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  description: string;
  cues: string[];
  constraints: string[];
  players: number; // min players needed
}

interface Team {
  id: string;
  name: string;
}

export default function DevelopmentPlansPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  
  // Player list state - moved before usage
  const [players, setPlayers] = useState<{ id: string; name: string; team: string; status: string }[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; team: string; status: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  
  // Infinite scroll state for players
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersHasMore, setPlayersHasMore] = useState(true);
  const [playersOffset, setPlayersOffset] = useState(0);

  // Handler for selecting a player
  const handlePlayerSelect = (player: { id: string; name: string; team: string; status: string }) => {
    setSelectedPlayer(player);
  };
  
  // Load more players when scrolling (like players page)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !playersLoading && playersHasMore) {
      // In a real implementation, this would fetch more players
      console.log('Load more players');
    }
  };

  // Filter players based on search and team filter
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
    return matchesSearch && matchesTeam;
  });
  const sortedPlayers = [...filteredPlayers].sort((a, b) => a.name.localeCompare(b.name));

  // Add state and handlers for search, team filter, and dropdown (copied from Players page)
  const [drillSuggestions, setDrillSuggestions] = useState<DrillSuggestion[]>([]);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Fetch data with validation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch development plans with validation
        const plansResponse = await fetch('/api/development-plans');
        if (plansResponse.ok) {
          const rawPlansData = await plansResponse.json();
          
          // Handle the API response structure: direct array of plans
          if (Array.isArray(rawPlansData)) {
            // Transform the API data to match our interface
            const transformedPlans = rawPlansData.map((plan: any) => ({
              id: plan.id || '',
              playerId: plan.playerId || '',
              playerName: plan.playerName || 'Unknown Player',
              coachId: plan.coachId || 'unknown',
              coachName: plan.coachName || 'Unknown Coach',
              title: plan.title || '',
              objective: plan.objective || '',
              description: plan.description || plan.objective || '',
              status: (plan.status || 'draft') as 'draft' | 'active' | 'completed' | 'archived',
              startDate: plan.startDate || new Date().toISOString(),
              endDate: plan.endDate || new Date().toISOString(),
              goals: plan.goals || [],
              tags: plan.tags || [],
              readiness: (plan.readiness || 'medium') as 'high' | 'medium' | 'low',
              lastUpdated: plan.updatedAt || new Date().toISOString(),
              createdAt: plan.createdAt || new Date().toISOString(),
              updatedAt: plan.updatedAt || new Date().toISOString(),
            }));
            
            // Validate plans data
            const validatedPlans = DevelopmentPlansArraySchema.safeParse(transformedPlans);
            if (!validatedPlans.success) {
              console.error('Invalid plans data:', validatedPlans.error);
              throw new Error('Invalid plans data received');
            }
            
            // Filter out any invalid plans
            const validPlans = validatedPlans.data.filter((plan): plan is DevelopmentPlan => 
              plan && typeof plan === 'object' && 
              typeof plan.id === 'string' && 
              typeof plan.playerId === 'string' &&
              typeof plan.playerName === 'string' &&
              typeof plan.coachId === 'string' &&
              typeof plan.coachName === 'string' &&
              typeof plan.title === 'string' &&
              typeof plan.objective === 'string' &&
              typeof plan.description === 'string' &&
              typeof plan.startDate === 'string' &&
              typeof plan.endDate === 'string' &&
              Array.isArray(plan.goals) &&
              Array.isArray(plan.tags) &&
              typeof plan.readiness === 'string' &&
              typeof plan.lastUpdated === 'string' &&
              typeof plan.createdAt === 'string' &&
              typeof plan.updatedAt === 'string' &&
              plan.id.trim() !== '' && 
              plan.playerId.trim() !== '' &&
              plan.playerName.trim() !== '' &&
              plan.coachId.trim() !== '' &&
              plan.coachName.trim() !== '' &&
              plan.title.trim() !== '' &&
              plan.objective.trim() !== '' &&
              plan.description.trim() !== '' &&
              plan.startDate.trim() !== '' &&
              plan.endDate.trim() !== '' &&
              plan.lastUpdated.trim() !== '' &&
              plan.createdAt.trim() !== '' &&
              plan.updatedAt.trim() !== ''
            );
            
            // Deduplicate plans by id
            const uniquePlans = Array.from(
              new Map(validPlans.map((plan) => [plan.id, plan])).values()
            );
            setPlans(uniquePlans);
          } else {
            console.error('Invalid API response structure for plans:', rawPlansData);
            setPlans([]);
          }
        }

        // Fetch players with validation (using pagination like other pages)
        const playersResponse = await fetch('/api/dashboard/players?offset=0&limit=10');
        if (playersResponse.ok) {
          const rawPlayersData = await playersResponse.json();
          // Handle the API response structure: { players: [...], total: number }
          if (rawPlayersData && rawPlayersData.players && Array.isArray(rawPlayersData.players)) {
            const transformedRawPlayers = rawPlayersData.players.map((player: any) => ({
              id: player.id,
              name: player.name || 'Unknown Player',
              team: player.team || 'Unknown Team',
              status: player.status || 'active',
            }));
            
            // Filter out any invalid players and ensure they match the expected Player type
            const validPlayers = transformedRawPlayers.filter((player: any): player is { id: string; name: string; team: string; status: string } => 
              player && typeof player === 'object' && 
              typeof player.id === 'string' && 
              typeof player.name === 'string' &&
              typeof player.team === 'string' &&
              player.id.trim() !== '' && 
              player.name.trim() !== '' &&
              player.team.trim() !== ''
            );
            
            // Deduplicate players by id
            const uniquePlayers = Array.from(
              new Map(validPlayers.map((player) => [player.id, player])).values()
            );
            setPlayers(uniquePlayers);
          } else {
            console.error('Invalid API response structure for players:', rawPlayersData);
            setPlayers([]);
          }
        }

        // Fetch teams with validation
        const teamsResponse = await fetch('/api/user/teams');
        if (teamsResponse.ok) {
          const rawTeamsData = await teamsResponse.json();
          
          // Validate teams data
          const validatedTeams = z.array(z.object({ id: z.string(), name: z.string() })).safeParse(rawTeamsData);
          if (!validatedTeams.success) {
            console.error('Invalid teams data:', validatedTeams.error);
            throw new Error('Invalid teams data received');
          }
          
          // Filter out any invalid teams and deduplicate by id
          const validTeams = validatedTeams.data.filter((team): team is Team => 
            team && typeof team === 'object' && 
            typeof team.id === 'string' && 
            typeof team.name === 'string' &&
            team.id.trim() !== '' && 
            team.name.trim() !== ''
          );
          
          const uniqueTeams = Array.from(
            new Map(validTeams.map((team) => [team.id, team])).values()
          );
          setTeams(uniqueTeams);
        }

        // Mock drill suggestions with validation
        const mockDrillSuggestions: DrillSuggestion[] = [
          {
            id: '1',
            name: 'Free Throw Practice',
            category: 'shooting',
            difficulty: 'beginner',
            duration: 20,
            description: 'Focused free throw practice with proper form',
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
        ];
        
        // Validate drill suggestions
        const validatedDrillSuggestions = z.array(z.object({
          id: z.string(),
          name: z.string(),
          category: z.enum(['shooting', 'ball_handling', 'defense', 'conditioning', 'team_play']),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
          duration: z.number(),
          description: z.string(),
          cues: z.array(z.string()),
          constraints: z.array(z.string()),
          players: z.number(),
        })).safeParse(mockDrillSuggestions);
        if (!validatedDrillSuggestions.success) {
          console.error('Invalid drill suggestions data:', validatedDrillSuggestions.error);
          throw new Error('Invalid drill suggestions data received');
        }
        
        // Filter out any invalid drill suggestions
        const validDrillSuggestions = validatedDrillSuggestions.data.filter((drill): drill is DrillSuggestion => 
          drill && typeof drill === 'object' && 
          typeof drill.id === 'string' && 
          typeof drill.name === 'string' &&
          typeof drill.description === 'string' &&
          drill.id.trim() !== '' && 
          drill.name.trim() !== '' &&
          drill.description.trim() !== ''
        );
        
        // Deduplicate drill suggestions by id
        const uniqueDrillSuggestions = Array.from(
          new Map(validDrillSuggestions.map((drill) => [drill.id, drill])).values()
        );
        setDrillSuggestions(uniqueDrillSuggestions);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        setPlans([]);
        // setPlayers([]); // This state is no longer needed
        // setTeams([]); // This state is no longer needed
        setDrillSuggestions([]);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    };
    fetchData();
  }, []);

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

  // Helper function for goal status icons
  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'not_started':
        return <Circle className="h-4 w-4 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Example loading/error states:
  if (loading && !sessionChecked) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">Loading development plans...</span>
          <div className="w-8 h-8 border-2 border-[#d8cc97] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen p-4 bg-[#161616] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">{error}</div>
      </div>
    );
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
      {/* Main Content: three columns, below header, to the right of sidebar */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
        {/* LEFT PANE: Player List */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <PlayersList
            playersById={Object.fromEntries(players.map(p => [p.id, p]))}
            playerIds={players.map(p => p.id)}
            teams={teams}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayer={selectedPlayer}
            onAddPlayer={undefined}
          />
        </div>
        {/* CENTER and RIGHT columns: leave unchanged except for being direct siblings in the flex layout */}
        <div className="flex-1 min-w-0">
          {/* CENTER: Active PDP Summary View */}
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
            {plans.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center h-96">
                <Target className="text-zinc-700 w-20 h-20 mb-5" />
                <h3 className="text-lg font-medium text-white mb-2">No Development Plans Found</h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                  No development plans are currently available for the players.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.length > 0 ? (
                  plans.map((plan) => (
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
        <div style={{ width: 340 }}>
          {/* RIGHT: Drill Suggestions */}
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">Drill Suggestions</h2>
          {plans.length === 0 ? (
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
                    <p className="text-xs text-zinc-400 mb-2">{drill.description}</p>
                    <p className="text-xs text-zinc-500">Duration: {drill.duration} minutes</p>
                    <p className="text-xs text-zinc-500">Players needed: {drill.players}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {drill.cues.map((cue, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-zinc-700 text-zinc-300">
                          {cue}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {drill.constraints.map((constraint, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-zinc-700 text-zinc-300">
                          {constraint}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}