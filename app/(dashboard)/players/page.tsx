'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Filter } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import UniversalButton from '@/components/ui/UniversalButton';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { z } from 'zod';
import type { Player as SharedPlayer } from '@/components/basketball/PlayerListCard';

// Types for observations
interface Observation {
  id: string;
  playerId: string;
  playerFirstName?: string | undefined;
  playerLastName?: string | undefined;
  playerName: string;
  title: string;
  description: string;
  rating: number;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string | null;
}

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

interface Team {
  id: string;
  name: string;
}

// Zod schema for Observation (matching actual API response)
const ObservationSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  playerFirstName: z.string().optional(),
  playerLastName: z.string().optional(),
  playerName: z.string(),
  title: z.string(),
  description: z.string(),
  rating: z.number(),
  date: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});
const ObservationsArraySchema = z.array(ObservationSchema);

// Zod schema for Team
const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
});
const TeamsArraySchema = z.array(TeamSchema);

export default function PlayersPage() {
  // Normalized state pattern - industry standard
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<
    (SharedPlayer & { team: string }) | null
  >(null);

  const [observations, setObservations] = useState<Observation[]>([]);
  const [developmentPlan, setDevelopmentPlan] =
    useState<DevelopmentPlan | null>(null);
  const [loadingDevelopmentPlan, setLoadingDevelopmentPlan] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // State for all players (no infinite scroll)
  const [allPlayersById, setAllPlayersById] = useState<
    Record<string, SharedPlayer & { team: string }>
  >({});
  const [allPlayerIds, setAllPlayerIds] = useState<string[]>([]);

  // State for loading team players
  const [loadingTeamPlayers, setLoadingTeamPlayers] = useState(false);

  // 1. Add state for all development plans
  const [allDevelopmentPlans, setAllDevelopmentPlans] = useState<
    DevelopmentPlan[]
  >([]);

  // Add state for plan view toggle
  const [planView, setPlanView] = useState<'active' | 'archived'>('active');

  // Add state to prevent multiple fetches
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  // Handler for selecting a player
  const handlePlayerSelect = (player: SharedPlayer & { team: string }) => {
    setSelectedPlayer(player);
    // Fetch development plan for the selected player
    fetchDevelopmentPlan(player.id);
  };

  // Clear development plan when no player is selected
  useEffect(() => {
    if (!selectedPlayer) {
      setDevelopmentPlan(null);
    }
  }, [selectedPlayer]);

  // Fetch development plan for a specific player
  const fetchDevelopmentPlan = async (playerId: string) => {
    setLoadingDevelopmentPlan(true);
    try {
      const response = await fetch('/api/development-plans');
      if (response.ok) {
        const plans = await response.json();

        // Find the plan for the selected player
        const playerPlan = plans.find(
          (plan: { playerId: string }) => plan.playerId === playerId
        );

        if (playerPlan) {
          // Transform the API data to match our interface
          const transformedPlan: DevelopmentPlan = {
            id: playerPlan.id || '',
            playerId: playerPlan.playerId || '',
            playerName: playerPlan.playerName || 'Unknown Player',
            coachName: 'Unknown Coach', // Not provided by API
            initialObservation: '', // Not provided by API
            objective: playerPlan.objective || '',
            description: playerPlan.objective || '', // Use objective as description
            status: (playerPlan.status || 'draft') as
              | 'draft'
              | 'active'
              | 'completed'
              | 'archived',
            startDate: playerPlan.startDate || new Date().toISOString(),
            endDate: playerPlan.endDate || null,
            goals: playerPlan.goals || [],
            tags: playerPlan.tags || [],
            readiness: (playerPlan.readiness || 'medium') as
              | 'high'
              | 'medium'
              | 'low',
            lastUpdated: playerPlan.updatedAt || new Date().toISOString(),
            createdAt: playerPlan.createdAt || new Date().toISOString(),
            updatedAt: playerPlan.updatedAt || new Date().toISOString(),
            title: playerPlan.objective || '',
          };
          setDevelopmentPlan(transformedPlan);
        } else {
          setDevelopmentPlan(null);
        }
      } else {
        setDevelopmentPlan(null);
      }
    } catch {
      setDevelopmentPlan(null);
    } finally {
      setLoadingDevelopmentPlan(false);
    }
  };

  // Handler for archiving a development plan
  const handleArchivePlan = () => {
    // In a real app, this would archive the development plan
    // console.log('Archiving development plan for player:', selectedPlayer);
    // For demo purposes, we'll just log it
    // console.log('Plan would be archived');
    // Close the modal
    // setShowArchivePlanModal(false); // This state was removed
  };

  // Handler for deleting a player
  const handleDeletePlayer = () => {
    // In a real app, this would delete the player
    // console.log('Deleting player:', selectedPlayer);
    // For demo purposes, we'll just log it
    // console.log('Player would be deleted');
  };

  // Fetch all players for All Teams
  const fetchAllPlayers = useCallback(async () => {
    try {
      // Fetch all players with a very high limit to ensure all are returned
      const response = await fetch(`/api/dashboard/players?limit=10000`);
      const data = await response.json();
      if (data.players) {
        const transformedPlayers = data.players.map(
          (player: {
            id: string;
            name?: string;
            team?: string;
            status?: string;
          }) => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            team: player.team || 'No Team',
            status: player.status || 'active',
          })
        ) as (SharedPlayer & { team: string })[];
        // Deduplicate by id
        const playersMap: Record<string, SharedPlayer & { team: string }> = {};
        const ids: string[] = [];
        transformedPlayers.forEach(player => {
          if (!playersMap[player.id]) {
            playersMap[player.id] = player;
            ids.push(player.id);
          }
        });
        setAllPlayersById(playersMap);
        setAllPlayerIds(ids);
      }
    } catch {
      // Error fetching all players
    }
  }, []); // Empty dependency array is correct - this function doesn't depend on any state

  // Fetch all players for a specific team
  const fetchPlayersForTeam = useCallback(async (teamName: string) => {
    setLoadingTeamPlayers(true);
    try {
      // Fetch all players (no offset/limit) and filter by team on the frontend
      const response = await fetch(`/api/dashboard/players?limit=1000`); // Large limit to get all
      const data = await response.json();
      if (data.players) {
        const filtered = data.players
          .filter((player: { team?: string }) => player.team === teamName)
          .map(
            (player: {
              id: string;
              name?: string;
              team?: string;
              status?: string;
            }) => ({
              id: player.id,
              name: player.name || 'Unknown Player',
              team: player.team || 'No Team',
              status: player.status || 'active',
            })
          ) as (SharedPlayer & { team: string })[];

        // Sort alphabetically
        const sortedPlayers = filtered.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        const playersMap: Record<string, SharedPlayer & { team: string }> = {};
        const ids: string[] = [];

        sortedPlayers.forEach((player: SharedPlayer & { team: string }) => {
          playersMap[player.id] = player;
          ids.push(player.id);
        });

        setAllPlayersById(playersMap);
        setAllPlayerIds(ids);
      }
    } catch {
      // Error fetching team players
    } finally {
      setLoadingTeamPlayers(false);
    }
  }, []); // Empty dependency array is correct - this function doesn't depend on any state

  // 2. Fetch all development plans on page load
  useEffect(() => {
    fetch('/api/development-plans')
      .then(res => (res.ok ? res.json() : []))
      .then((plans: DevelopmentPlan[]) => setAllDevelopmentPlans(plans))
      .catch(() => setAllDevelopmentPlans([]));
  }, []);

  useEffect(() => {
    // Fetch teams
    fetch('/api/user/teams')
      .then(res => {
        if (!res.ok) {
          // console.log('Teams API returned error status:', res.status);
          setTeams([]);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return; // Skip if no data (error case)

        let arr: unknown = data;
        if (data && Array.isArray(data)) {
          arr = data;
        }
        const result = TeamsArraySchema.safeParse(arr);
        if (result.success) {
          // Deduplicate teams by id
          const uniqueTeams = Array.from(
            new Map(result.data.map(team => [team.id, team])).values()
          );
          uniqueTeams.sort((a, b) => a.name.localeCompare(b.name));
          setTeams(uniqueTeams);
        } else {
          // console.error('Zod validation error for teams:', result.error);
          setTeams([]);
        }
      })
      .catch(() => {
        // console.error('Error fetching teams:', error);
        setTeams([]);
      });

    // Fetch observations
    fetch('/api/observations')
      .then(res => {
        if (!res.ok) {
          // console.log('Observations API returned error status:', res.status);
          setObservations([]);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return; // Skip if no data (error case)

        // Handle the API response structure: { observations: [...], total: number }
        if (data && data.observations && Array.isArray(data.observations)) {
          const result = ObservationsArraySchema.safeParse(data.observations);
          if (result.success) {
            setObservations(result.data);
          } else {
            // console.error('Zod validation error for observations:', result.error);
            setObservations([]);
          }
        } else {
          // console.error('Invalid API response structure for observations:', data);
          setObservations([]);
        }
      })
      .catch(() => {
        // console.error('Error fetching observations:', err);
      });
  }, []); // Remove fetchAllPlayers from dependency array to prevent infinite loop

  // Separate useEffect for initial data fetching
  useEffect(() => {
    if (!hasFetchedInitialData) {
      fetchAllPlayers();
      setHasFetchedInitialData(true);
    }
  }, [hasFetchedInitialData, fetchAllPlayers]);

  // Handle team filter changes
  useEffect(() => {
    if (teamFilter === 'all') {
      // Reset and fetch all players
      fetchAllPlayers();
    } else {
      // Fetch all players for specific team
      fetchPlayersForTeam(teamFilter);
    }
  }, [teamFilter]); // Remove fetchAllPlayers and fetchPlayersForTeam from dependencies to prevent infinite loop

  // Reset search when team filter changes
  useEffect(() => {
    setSearchTerm('');
  }, [teamFilter]);

  // Defensive: always check Array.isArray before .filter
  const safeObservations = Array.isArray(observations)
    ? observations.filter(Boolean)
    : [];
  const playerObservations = selectedPlayer
    ? safeObservations
        .filter(
          (obs): obs is Observation => !!obs && typeof obs.playerId === 'string'
        )
        .filter(obs => obs.playerId === selectedPlayer.id)
    : [];

  // 1. Add a function to check if a player has a development plan
  const hasDevelopmentPlan = (playerId: string) =>
    allDevelopmentPlans.some(plan => plan.playerId === playerId);

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

      {/* Main Content */}
      <div
        className="flex-1 flex ml-64 pt-16 bg-black min-h-screen"
        style={{ background: 'black', minHeight: '100vh' }}
      >
        {/* LEFT PANE: Player List */}
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
            {loadingTeamPlayers && allPlayerIds.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8cc97] mx-auto mb-4"></div>
                <p className="text-zinc-400 text-sm">Loading players...</p>
              </div>
            ) : allPlayerIds.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No players found</p>
              </div>
            ) : (
              <>
                {allPlayerIds.map((playerId: string) => {
                  const player = allPlayersById[playerId];
                  if (!player) return null;
                  const hasPlan = hasDevelopmentPlan(player.id);
                  const isSelected = selectedPlayer?.id === player.id;
                  return (
                    <div
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        hasPlan ? 'border-[#d8cc97]' : 'border-red-500'
                      } ${isSelected ? 'bg-zinc-800' : 'bg-zinc-800/50 hover:bg-zinc-800'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {player.name}
                          </p>
                          <p className="text-sm text-zinc-400">{player.team}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* MIDDLE PANE: Player Profile */}
        <div className="flex-1 p-6 bg-black">
          {selectedPlayer ? (
            <div className="space-y-6">
              {/* Player Profile Header */}
              <h2 className="text-xl font-bold text-[#d8cc97] mt-0 mb-6">
                Profile
              </h2>
              {/* Player Profile Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">
                      {selectedPlayer.name}
                    </p>
                    <p className="text-md text-zinc-400">
                      {selectedPlayer.team}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-full hover:bg-zinc-800 focus:outline-none">
                        <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          /* Edit player logic */
                        }}
                      >
                        Edit Player
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={handleDeletePlayer}
                      >
                        Delete Player
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* No status for now */}
              </div>

              {/* Development Plan Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  {/* Segmented control for Active/Archived plans */}
                  <div className="flex gap-2">
                    <button
                      className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${planView === 'active' ? 'bg-gold-500/20 text-gold-500' : 'bg-zinc-800 text-zinc-400 hover:text-gold-500'}`}
                      onClick={() => setPlanView('active')}
                    >
                      Active Plans
                    </button>
                    <button
                      className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${planView === 'archived' ? 'bg-gold-500/20 text-gold-500' : 'bg-zinc-800 text-zinc-400 hover:text-gold-500'}`}
                      onClick={() => setPlanView('archived')}
                    >
                      Archived Plans
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {planView === 'active' && (
                      <UniversalButton.Secondary
                        size="sm"
                        onClick={handleArchivePlan}
                      >
                        Move to Archive
                      </UniversalButton.Secondary>
                    )}
                  </div>
                </div>
                {/* Show active or archived plan(s) based on toggle */}
                {planView === 'active' ? (
                  loadingDevelopmentPlan ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8cc97] mx-auto mb-4"></div>
                      <p className="text-zinc-400 text-sm">
                        Loading development plan...
                      </p>
                    </div>
                  ) : developmentPlan ? (
                    <div className="space-y-4">
                      <p className="text-sm text-zinc-300">
                        {developmentPlan.description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                      <p className="text-zinc-400 mb-2">
                        No development plan created yet
                      </p>
                    </div>
                  )
                ) : (
                  // Placeholder for archived plans (future: map over archived plans)
                  <div className="text-center py-8">
                    <Shield className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">No archived plans yet</p>
                    <p className="text-sm text-zinc-500">
                      Archived plans will appear here when available
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center h-full">
              <Shield className="text-zinc-700 w-20 h-20 mb-5" />
              <h3 className="text-lg font-medium text-white mb-2">
                Select a Player to View Their Profile
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                Select a player from the list to view their profile details and
                development plan.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Observations Panel */}
        <div className="w-1/4 p-6 bg-black flex flex-col min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#d8cc97] mt-0 mb-6">
              Observations
            </h2>
            {selectedPlayer && playerObservations.length > 3 && (
              <a
                href={`/observations?player_id=${selectedPlayer.id}`}
                className="text-gold-500 text-sm hover:underline"
              >
                View All
              </a>
            )}
          </div>
          {selectedPlayer ? (
            playerObservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Shield className="text-zinc-700 w-16 h-16 mb-4" />
                <p className="text-zinc-400 text-sm">No observations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {playerObservations.slice(0, 3).map(obs => (
                  <div
                    key={obs.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                  >
                    <p className="text-xs text-zinc-500 mb-2">
                      {new Date(obs.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {obs.description}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Shield className="text-zinc-700 w-16 h-16 mb-4" />
              <p className="text-zinc-400 text-sm">No observations yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
