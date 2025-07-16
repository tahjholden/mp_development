'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Target, Zap, Lightbulb, Shield, Search, Filter } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { UniversalButton } from '@/components/ui/UniversalButton';
import type { PlayerStatus } from '@/components/basketball/PlayerListCard';

// Define Player type locally to match the actual data structure
interface Player {
  id: string;
  name: string;
  team: string;
  status: PlayerStatus;
}
import { z } from 'zod';

// Types for development plans
interface DevelopmentPlan {
  id: string;
  playerId: string;
  playerName: string;
  coachName?: string;
  initialObservation?: string;
  objective: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string | null;
  goals?: DevelopmentGoal[];
  tags?: string[];
  readiness?: 'high' | 'medium' | 'low';
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string; // for UI compatibility
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
  category:
    | 'shooting'
    | 'ball_handling'
    | 'defense'
    | 'conditioning'
    | 'team_play';
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

// API response types
interface ApiPlayer {
  id: string;
  name?: string;
  team?: string;
  status?: string;
}

interface ApiPlan {
  id?: string;
  playerId?: string;
  playerName?: string;
  objective?: string;
  status?: string;
  startDate?: string;
  endDate?: string | null;
  goals?: DevelopmentGoal[];
  tags?: string[];
  readiness?: string;
  updatedAt?: string;
  createdAt?: string;
}

export default function DevelopmentPlansPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);

  // Player list state - EXACT SAME AS PLAYERS PAGE
  const [playersById] = useState<Record<string, Player>>({});
  const [playerIds] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Search and filter state - EXACT SAME AS PLAYERS PAGE
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // NEW: Player selection tracking for suggestions
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{
    drills: DrillSuggestion[];
    constraints: any[];
    combined: any[];
  }>({ drills: [], constraints: [], combined: [] });

  // ADD: Development plan state for styling
  const [allDevelopmentPlans, setAllDevelopmentPlans] = useState<
    DevelopmentPlan[]
  >([]);

  // ADD: Function to check if a player has a development plan
  const hasDevelopmentPlan = (playerId: string) =>
    allDevelopmentPlans.some(plan => plan.playerId === playerId);

  // Handler for selecting a player - EXACT SAME AS PLAYERS PAGE
  const handlePlayerSelect = (player: Player) => {
    // NEW: Support multiple player selection
    setSelectedPlayerIds(prevIds => {
      if (prevIds.includes(player.id)) {
        // Remove player if already selected
        return prevIds.filter(id => id !== player.id);
      } else {
        // Add player to selection
        return [...prevIds, player.id];
      }
    });
  };

  // NEW: Fetch suggestions when selected players change
  useEffect(() => {
    if (selectedPlayerIds.length > 0) {
      fetchPlansAndSuggestions(selectedPlayerIds);
    } else {
      setSuggestions({ drills: [], constraints: [], combined: [] });
    }
  }, [selectedPlayerIds]);

  // NEW: Function to fetch plans and suggestions
  const fetchPlansAndSuggestions = async (playerIds: string[]) => {
    try {
      // Fetch development plans for selected players
      const plansResponse = await fetch(
        `/api/development-plans?playerIds=${playerIds.join(',')}`
      );
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(Array.isArray(plansData) ? plansData : []);
      }

      // Fetch suggestions for selected players
      const suggestionsResponse = await fetch(
        `/api/suggestions?playerIds=${playerIds.join(',')}`
      );
      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error('Error fetching plans and suggestions:', error);
    }
  };

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
            const transformedPlans = rawPlansData.map((plan: ApiPlan) => ({
              id: plan.id || '',
              playerId: plan.playerId || '',
              playerName: plan.playerName || 'Unknown Player',
              coachName: 'Unknown Coach', // Not provided by API
              initialObservation: '', // Not provided by API
              objective: plan.objective || '',
              description: plan.objective || '', // Use objective as description
              status: (plan.status || 'draft') as
                | 'draft'
                | 'active'
                | 'completed'
                | 'archived',
              startDate: plan.startDate || new Date().toISOString(),
              endDate: plan.endDate || null, // API can return null
              goals: plan.goals || [],
              tags: plan.tags || [],
              readiness: (plan.readiness || 'medium') as
                | 'high'
                | 'medium'
                | 'low',
              lastUpdated: plan.updatedAt || new Date().toISOString(),
              createdAt: plan.createdAt || new Date().toISOString(),
              updatedAt: plan.updatedAt || new Date().toISOString(),
              // For UI compatibility, add a title field mapped from objective
              title: plan.objective || '',
            }));

            // Skip validation for now to debug the issue
            const validPlans = transformedPlans.filter(
              (plan: DevelopmentPlan) =>
                plan &&
                typeof plan === 'object' &&
                typeof plan.id === 'string' &&
                typeof plan.playerId === 'string' &&
                typeof plan.playerName === 'string' &&
                typeof plan.objective === 'string' &&
                plan.id.trim() !== '' &&
                plan.playerId.trim() !== '' &&
                plan.playerName.trim() !== '' &&
                plan.objective.trim() !== ''
            ) as DevelopmentPlan[];

            // Deduplicate plans by id
            const uniquePlans = Array.from(
              new Map(validPlans.map(plan => [plan.id, plan])).values()
            );
            setPlans(uniquePlans);
            // ADD: Set all development plans for styling
            setAllDevelopmentPlans(uniquePlans);
          } else {
            setPlans([]);
          }
        }

        // Fetch teams with validation
        const teamsResponse = await fetch('/api/user/teams');
        if (teamsResponse.ok) {
          const rawTeamsData = await teamsResponse.json();

          // Validate teams data
          const validatedTeams = z
            .array(z.object({ id: z.string(), name: z.string() }))
            .safeParse(rawTeamsData);
          if (!validatedTeams.success) {
            throw new Error('Invalid teams data received');
          }

          // Filter out any invalid teams and deduplicate by id
          const validTeams = validatedTeams.data.filter(
            (team): team is Team =>
              team &&
              typeof team === 'object' &&
              typeof team.id === 'string' &&
              typeof team.name === 'string' &&
              team.id.trim() !== '' &&
              team.name.trim() !== ''
          );

          const uniqueTeams = Array.from(
            new Map(validTeams.map(team => [team.id, team])).values()
          );
          setTeams(uniqueTeams);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // State for all players (no infinite scroll)
  const [allPlayersById, setAllPlayersById] = useState<Record<string, Player>>(
    {}
  );
  const [allPlayerIds, setAllPlayerIds] = useState<string[]>([]);
  const [allLoadingPlayers, setAllLoadingPlayers] = useState(false);

  // Fetch all players (no infinite scroll)
  const fetchAllPlayers = useCallback(async () => {
    setAllLoadingPlayers(true);
    try {
      const response = await fetch('/api/dashboard/players?limit=1000');
      const data = await response.json();
      if (data.players) {
        const transformedPlayers = data.players.map((player: ApiPlayer) => ({
          id: player.id,
          name: player.name || 'Unknown Player',
          team: player.team || 'No Team',
          status: (player.status as PlayerStatus) || 'active',
        }));
        const playersMap: Record<string, Player> = {};
        const ids: string[] = [];
        transformedPlayers.forEach((player: Player) => {
          if (!playersMap[player.id]) {
            playersMap[player.id] = player;
            ids.push(player.id);
          }
        });
        setAllPlayersById(playersMap);
        setAllPlayerIds(ids);
      }
    } catch {
      setError('Failed to fetch all players');
    } finally {
      setAllLoadingPlayers(false);
    }
  }, []);

  // Fetch all players on mount or when All Teams is selected
  useEffect(() => {
    if (teamFilter === 'all') {
      fetchAllPlayers();
    }
  }, [teamFilter, fetchAllPlayers]);

  // Player list rendering logic
  const sortedAllPlayers = [...allPlayerIds.map(id => allPlayersById[id])]
    .filter((player): player is Player => !!player && !!player.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const sortedTeamPlayers = [...playerIds.map(id => playersById[id])]
    .filter((player): player is Player => !!player && !!player.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const playersToShow =
    teamFilter === 'all' ? sortedAllPlayers : sortedTeamPlayers;

  // In the player list UI:
  // - Use playersToShow for rendering
  // - For 'All Teams', show a loading spinner at the bottom if allLoadingPlayers
  // - No infinite scroll - all players loaded at once
  // - Never show blank unless playersToShow.length === 0

  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No start date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Example loading/error states:
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">
            Loading development plans...
          </span>
          <div className="w-8 h-8 border-2 border-[#d8cc97] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen p-4 bg-[#161616] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen h-full bg-black text-white"
      style={{ background: 'black' }}
    >
      {/* Header - exact replica with coach info */}
      <header
        className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between"
        style={{ boxShadow: 'none' }}
      >
        <span
          className="text-2xl font-bold tracking-wide text-[#d8cc97]"
          style={{ letterSpacing: '0.04em' }}
        >
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">
            Coach
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            coach@example.com
          </span>
          <span className="text-xs text-white leading-tight">Coach</span>
        </div>
      </header>
      {/* Sidebar */}
      <Sidebar
        user={{
          name: 'Coach',
          email: 'coach@example.com',
          role: 'Coach',
        }}
      />
      {/* Main Content: three columns, below header, to the right of sidebar */}
      <div
        className="flex-1 flex ml-64 pt-16 bg-black min-h-screen"
        style={{ background: 'black', minHeight: '100vh' }}
      >
        {/* LEFT PANE: Player List - EXACT SAME AS PLAYERS PAGE */}
        <div
          className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#d8cc97] mt-0">Players</h2>
          </div>
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => {
                        setTeamFilter(team.name);
                        setIsTeamDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700"
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Player List - Fixed height for exactly 10 player cards */}
          <div
            className="flex-1 overflow-y-auto space-y-2"
            style={{ maxHeight: '400px' }} // Exactly 10 player cards (10 * 40px)
          >
            {playersToShow.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No players found</p>
              </div>
            ) : (
              playersToShow.map((player: Player) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    hasDevelopmentPlan(player.id)
                      ? 'border-[#d8cc97]'
                      : 'border-red-500'
                  } ${
                    selectedPlayerIds.includes(player.id)
                      ? 'bg-[#d8cc97]/20'
                      : 'bg-zinc-800/50 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {String(player.name)}
                      </p>
                      <p className="text-sm text-zinc-400">{player.team}</p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        player.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-zinc-500'
                      }`}
                    />
                  </div>
                </div>
              ))
            )}
            {allLoadingPlayers && teamFilter === 'all' && (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 border-2 border-[#d8cc97] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
        {/* MIDDLE PANE: Development Plans */}
        <div className="flex-1 p-6 bg-black">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#d8cc97]">
                Development Plans
              </h2>
              <div className="flex gap-2">
                <UniversalButton.Primary size="sm">
                  Export Plan
                </UniversalButton.Primary>
              </div>
            </div>
            {plans.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center h-96">
                <Target className="text-zinc-700 w-20 h-20 mb-5" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Development Plans Found
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                  No development plans are currently available for the players.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.length > 0 ? (
                  plans.map(plan => (
                    <div
                      key={plan.id}
                      className="bg-zinc-800 px-6 py-3 rounded transition-all"
                      style={{ background: '#181818' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <div className="text-base font-bold text-[#d8cc97]">
                            {plan.playerName}
                          </div>
                          <div className="text-xs text-zinc-400">
                            Started: {formatDate(plan.startDate)}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 line-clamp-3">
                        {plan.objective || 'No plan content provided'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                    <Target className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">
                      No development plans found for selected players
                    </p>
                    <p className="text-sm text-zinc-500">
                      Create development plans to track player progress
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Suggestions Panel */}
        <div className="w-1/4 p-6 bg-black flex flex-col min-h-screen">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">
            {selectedPlayerIds.length === 1
              ? 'Player Suggestions'
              : 'Group Suggestions'}
          </h2>

          {selectedPlayerIds.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">
                Select a player to see suggestions
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Individual or group practice recommendations
              </p>
            </div>
          ) : selectedPlayerIds.length === 1 ? (
            // Individual player suggestions
            <div className="space-y-6">
              {/* Active Development Plans */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="text-[#d8cc97] w-4 h-4" />
                  <h4 className="font-medium text-white">
                    Active Development Plans
                  </h4>
                </div>
                {plans.length > 0 ? (
                  <div className="space-y-2">
                    {plans.slice(0, 2).map(plan => (
                      <div key={plan.id} className="bg-zinc-700/50 rounded p-3">
                        <p className="text-sm text-white font-medium">
                          {plan.playerName}
                        </p>
                        <p className="text-xs text-zinc-400 line-clamp-2">
                          {plan.objective}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">No active plans found</p>
                )}
              </div>

              {/* Top 2 Drill Suggestions */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="text-[#d8cc97] w-4 h-4" />
                  <h4 className="font-medium text-white">
                    Top 2 Drill Suggestions
                  </h4>
                </div>
                {suggestions.drills.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.drills.map(drill => (
                      <div
                        key={drill.id}
                        className="bg-zinc-700/50 rounded p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-white text-sm">
                            {drill.name}
                          </h5>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              drill.difficulty === 'beginner'
                                ? 'bg-green-500/20 text-green-500'
                                : drill.difficulty === 'intermediate'
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-red-500/20 text-red-500'
                            }`}
                          >
                            {drill.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mb-2">
                          {drill.description}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Duration: {drill.duration} min
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    No drill suggestions available
                  </p>
                )}
              </div>

              {/* Top 2 Constraint Suggestions */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="text-[#d8cc97] w-4 h-4" />
                  <h4 className="font-medium text-white">
                    Top 2 Constraint Suggestions
                  </h4>
                </div>
                {suggestions.constraints.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.constraints.map(constraint => (
                      <div
                        key={constraint.id}
                        className="bg-zinc-700/50 rounded p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-white text-sm">
                            {constraint.name}
                          </h5>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              constraint.difficulty === 'beginner'
                                ? 'bg-green-500/20 text-green-500'
                                : constraint.difficulty === 'intermediate'
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-red-500/20 text-red-500'
                            }`}
                          >
                            {constraint.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {constraint.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    No constraint suggestions available
                  </p>
                )}
              </div>

              {/* Combined Drill + Constraint Bundle */}
              {suggestions.combined.length > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="text-[#d8cc97] w-4 h-4" />
                    <h4 className="font-medium text-white">
                      Combined Practice Bundle
                    </h4>
                  </div>
                  {suggestions.combined.map(combo => (
                    <div key={combo.id} className="bg-zinc-700/50 rounded p-3">
                      <h5 className="font-medium text-white text-sm mb-2">
                        {combo.name}
                      </h5>
                      <p className="text-xs text-zinc-400 mb-2">
                        {combo.description}
                      </p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {combo.drill.name}
                        </span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          {combo.constraint.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Multiple players - Group suggestions
            <div className="space-y-6">
              {/* Group Practice Overview */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="text-[#d8cc97] w-4 h-4" />
                  <h4 className="font-medium text-white">
                    Group Practice Overview
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mb-3">
                  {selectedPlayerIds.length} players selected
                </p>
                <p className="text-xs text-zinc-400">
                  Showing common themes and group practice suggestions
                </p>
              </div>

              {/* Top Common Drill */}
              {suggestions.drills.length > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="text-[#d8cc97] w-4 h-4" />
                    <h4 className="font-medium text-white">Top Common Drill</h4>
                  </div>
                  {suggestions.drills.map(drill => (
                    <div key={drill.id} className="bg-zinc-700/50 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-white text-sm">
                          {drill.name}
                        </h5>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            drill.difficulty === 'beginner'
                              ? 'bg-green-500/20 text-green-500'
                              : drill.difficulty === 'intermediate'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {drill.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-2">
                        {drill.description}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Duration: {drill.duration} min
                      </p>
                      <p className="text-xs text-zinc-500">
                        Players: {drill.players}+
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Common Constraint */}
              {suggestions.constraints.length > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="text-[#d8cc97] w-4 h-4" />
                    <h4 className="font-medium text-white">
                      Top Common Constraint
                    </h4>
                  </div>
                  {suggestions.constraints.map(constraint => (
                    <div
                      key={constraint.id}
                      className="bg-zinc-700/50 rounded p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-white text-sm">
                          {constraint.name}
                        </h5>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            constraint.difficulty === 'beginner'
                              ? 'bg-green-500/20 text-green-500'
                              : constraint.difficulty === 'intermediate'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {constraint.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {constraint.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Group Practice Bundle */}
              {suggestions.combined.length > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="text-[#d8cc97] w-4 h-4" />
                    <h4 className="font-medium text-white">
                      Group Practice Bundle
                    </h4>
                  </div>
                  {suggestions.combined.map(combo => (
                    <div key={combo.id} className="bg-zinc-700/50 rounded p-3">
                      <h5 className="font-medium text-white text-sm mb-2">
                        {combo.name}
                      </h5>
                      <p className="text-xs text-zinc-400 mb-2">
                        {combo.description}
                      </p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {combo.drill.name}
                        </span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          {combo.constraint.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
