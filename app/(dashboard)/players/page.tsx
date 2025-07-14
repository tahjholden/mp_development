'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, Search, Filter } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import UniversalButton from '@/components/ui/UniversalButton';
import UniversalModal from '@/components/ui/UniversalModal';
import AddPlayerModal from '@/components/basketball/AddPlayerModal';
import ArchivePlanModal from '@/components/basketball/ArchivePlanModal';
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
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showDeletePlayerModal, setShowDeletePlayerModal] = useState(false);
  const [showArchivePlanModal, setShowArchivePlanModal] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [developmentPlan, setDevelopmentPlan] =
    useState<DevelopmentPlan | null>(null);
  const [loadingDevelopmentPlan, setLoadingDevelopmentPlan] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // State for infinite scroll (All Teams)
  const [allPlayersById, setAllPlayersById] = useState<
    Record<string, SharedPlayer & { team: string }>
  >({});
  const [allPlayerIds, setAllPlayerIds] = useState<string[]>([]);
  const [allOffset, setAllOffset] = useState(0);
  const [allHasMore, setAllHasMore] = useState(true);
  const [allLoadingPlayers, setAllLoadingPlayers] = useState(false);

  // State for specific team (no infinite scroll)
  const [teamPlayersById, setTeamPlayersById] = useState<
    Record<string, SharedPlayer & { team: string }>
  >({});
  const [teamPlayerIds, setTeamPlayerIds] = useState<string[]>([]);
  const [loadingTeamPlayers, setLoadingTeamPlayers] = useState(false);

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

  // Handler for deleting a player
  const handleDeletePlayer = () => {
    setShowDeletePlayerModal(true);
  };

  // Handler for archiving a development plan
  const handleArchivePlan = () => {
    setShowArchivePlanModal(true);
  };

  // Handler for add player form submission
  const handleAddPlayerSubmit = () => {
    // In a real app, this would add the player to the database
    // console.log('Adding player:', data);

    // For demo purposes, we'll just log it
    // console.log('New player would be added:', newPlayer);

    // Close the modal
    setShowAddPlayerModal(false);
  };

  // Handler for delete player confirmation
  const handleDeletePlayerConfirm = () => {
    // In a real app, this would delete the player from the database
    // console.log('Deleting player:', selectedPlayer);

    // For demo purposes, we'll just log it and clear the selection
    setSelectedPlayer(null);

    // Close the modal
    setShowDeletePlayerModal(false);
  };

  // Handler for archive plan confirmation
  const handleArchivePlanConfirm = () => {
    // In a real app, this would archive the development plan
    // console.log('Archiving development plan for player:', selectedPlayer);

    // For demo purposes, we'll just log it
    // console.log('Plan would be archived');

    // Close the modal
    setShowArchivePlanModal(false);
  };

  // Infinite scroll fetch for All Teams
  const fetchAllPlayers = useCallback(
    async (currentOffset: number = 0, reset: boolean = false) => {
      setAllLoadingPlayers(true);
      try {
        const response = await fetch(
          `/api/dashboard/players?offset=${currentOffset}&limit=20`
        );
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

          if (reset) {
            // Reset the list with normalized state
            const playersMap: Record<string, SharedPlayer & { team: string }> =
              {};
            const ids: string[] = [];

            transformedPlayers.forEach(
              (player: SharedPlayer & { team: string }) => {
                if (!playersMap[player.id]) {
                  playersMap[player.id] = player;
                  ids.push(player.id);
                }
              }
            );

            setAllPlayersById(playersMap);
            setAllPlayerIds(ids);
            setAllOffset(20);
          } else {
            // Append to existing list with normalized state
            setAllPlayersById(prevPlayersById => {
              const newPlayersById = { ...prevPlayersById };
              const newIds: string[] = [];

              transformedPlayers.forEach(
                (player: SharedPlayer & { team: string }) => {
                  if (!newPlayersById[player.id]) {
                    newPlayersById[player.id] = player;
                    newIds.push(player.id);
                  }
                }
              );

              setAllPlayerIds(prevIds => [...prevIds, ...newIds]);
              return newPlayersById;
            });
            setAllOffset(prev => prev + 20);
          }

          setAllHasMore(data.players.length === 20);
        }
      } catch {
        // Error fetching all players
      } finally {
        setAllLoadingPlayers(false);
      }
    },
    []
  );

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

        setTeamPlayersById(playersMap);
        setTeamPlayerIds(ids);
      }
    } catch {
      // Error fetching team players
    } finally {
      setLoadingTeamPlayers(false);
    }
  }, []);

  // Load more players when scrolling (All Teams only)
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (teamFilter === 'all') {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (
          scrollHeight - scrollTop <= clientHeight * 1.5 &&
          !allLoadingPlayers &&
          allHasMore
        ) {
          fetchAllPlayers(allOffset);
        }
      }
    },
    [fetchAllPlayers, allLoadingPlayers, allHasMore, allOffset, teamFilter]
  );

  // Determine which player list to use
  const playersToShow = teamFilter === 'all' ? allPlayerIds : teamPlayerIds;
  const playersByIdToUse =
    teamFilter === 'all' ? allPlayersById : teamPlayersById;
  const loadingPlayersToShow =
    teamFilter === 'all' ? allLoadingPlayers : loadingTeamPlayers;

  // Filter players based on search and team filter
  const filteredPlayers = playersToShow
    .map(id => playersByIdToUse[id])
    .filter(
      (
        player: (SharedPlayer & { team: string }) | undefined
      ): player is SharedPlayer & { team: string } => !!player && !!player.id
    )
    .filter(player => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch; // Team filter is already applied by the data source
    });

  // Sort players alphabetically
  const sortedPlayers = [...filteredPlayers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  // Debug: log duplicate IDs or undefined/null
  if (typeof window !== 'undefined') {
    const idSet = new Set();
    for (const p of sortedPlayers) {
      if (idSet.has(p.id)) {
        // console.error('DUPLICATE ID:', p.id);
      }
      idSet.add(p.id);
    }
    if (sortedPlayers.some(p => !p || !p.id)) {
      // console.error('Undefined or null player in sortedPlayers', sortedPlayers);
    }
  }

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

    // Fetch initial players for All Teams
    fetchAllPlayers(0, true);

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
  }, [fetchAllPlayers]);

  // Handle team filter changes
  useEffect(() => {
    if (teamFilter === 'all') {
      // Reset and fetch all players with infinite scroll
      setAllOffset(0);
      setAllHasMore(true);
      fetchAllPlayers(0, true);
    } else {
      // Fetch all players for specific team
      fetchPlayersForTeam(teamFilter);
    }
  }, [teamFilter, fetchAllPlayers, fetchPlayersForTeam]);

  // Reset search when team filter changes
  useEffect(() => {
    setSearchTerm('');
  }, [teamFilter]);

  // Helper to get rating stars
  const getRatingStars = (rating: number | undefined): React.ReactElement[] => {
    const safeRating = typeof rating === 'number' ? rating : 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Shield
        key={i}
        className={`h-4 w-4 ${i < safeRating ? 'text-yellow-500 fill-current' : 'text-zinc-600'}`}
      />
    ));
  };

  // Helper functions for development plan display
  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'not_started':
        return <Shield className="h-4 w-4 text-gray-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

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
            onScroll={handleScroll}
          >
            {loadingPlayersToShow && sortedPlayers.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8cc97] mx-auto mb-4"></div>
                <p className="text-zinc-400 text-sm">Loading players...</p>
              </div>
            ) : sortedPlayers.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No players found</p>
              </div>
            ) : (
              <>
                {sortedPlayers.map(
                  (player: SharedPlayer & { team: string }) => (
                    <div
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedPlayer?.id === player.id
                          ? 'bg-[#d8cc97]/20 border border-[#d8cc97]'
                          : 'bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {player.name}
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
                  )
                )}
                {/* Loading indicator for infinite scroll */}
                {teamFilter === 'all' && allLoadingPlayers && allHasMore && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#d8cc97] mx-auto"></div>
                    <p className="text-zinc-400 text-xs mt-2">
                      Loading more...
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* MIDDLE PANE: Player Profile */}
        <div className="flex-1 p-6 bg-black">
          {selectedPlayer ? (
            <div className="space-y-6">
              {/* Player Profile Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#d8cc97]">
                    Player Profile
                  </h3>
                  <div className="flex gap-2">
                    <UniversalButton.Secondary
                      size="sm"
                      onClick={() => {
                        /* Edit player logic */
                      }}
                    >
                      Edit Player
                    </UniversalButton.Secondary>

                    <UniversalButton.Danger
                      size="sm"
                      onClick={handleDeletePlayer}
                    >
                      Delete Player
                    </UniversalButton.Danger>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Name</p>
                      <p className="text-white">{selectedPlayer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Team</p>
                      <p className="text-white">{selectedPlayer.team}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">Status</p>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        selectedPlayer.status === 'active'
                          ? 'bg-gold-500/20 text-gold-500'
                          : 'bg-danger-500/20 text-danger-500'
                      }`}
                    >
                      {selectedPlayer.status === 'active'
                        ? 'Active'
                        : 'Archived'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Development Plan Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#d8cc97]">
                    Development Plan
                  </h3>
                  <div className="flex gap-2">
                    <UniversalButton.Primary size="sm">
                      Create Plan
                    </UniversalButton.Primary>
                    <UniversalButton.Secondary
                      size="sm"
                      onClick={handleArchivePlan}
                    >
                      Archive Plan
                    </UniversalButton.Secondary>
                  </div>
                </div>

                {loadingDevelopmentPlan ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8cc97] mx-auto mb-4"></div>
                    <p className="text-zinc-400 text-sm">
                      Loading development plan...
                    </p>
                  </div>
                ) : developmentPlan ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-[#d8cc97]">
                          {developmentPlan.title
                            ? developmentPlan.title
                            : 'Untitled Plan'}
                        </h4>
                        <p className="text-sm text-zinc-300 mb-2">
                          {developmentPlan.objective
                            ? developmentPlan.objective
                            : 'No objective provided'}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Player: {developmentPlan.playerName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={
                            developmentPlan.status === 'active'
                              ? 'inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500'
                              : developmentPlan.status === 'completed'
                                ? 'inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-500'
                                : 'inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500'
                          }
                        >
                          {(developmentPlan.status || 'draft')
                            .charAt(0)
                            .toUpperCase() +
                            (developmentPlan.status || 'draft').slice(1)}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${getReadinessColor(developmentPlan.readiness || 'medium')}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-zinc-400 mb-2">
                          Focus Areas
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {(developmentPlan.tags || []).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-zinc-800 text-zinc-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {(developmentPlan.tags || []).length === 0 && (
                            <span className="text-xs text-zinc-500">
                              No focus areas defined
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-zinc-400 mb-2">
                          Active Goals
                        </h5>
                        <div className="space-y-2">
                          {(developmentPlan.goals || [])
                            .filter(g => g.status !== 'completed')
                            .slice(0, 3)
                            .map(goal => (
                              <div
                                key={goal.id}
                                className="flex items-center space-x-2 p-2 bg-zinc-800/50 rounded"
                              >
                                {getGoalStatusIcon(goal.status)}
                                <span className="text-sm text-white">
                                  {goal.title}
                                </span>
                              </div>
                            ))}
                          {(developmentPlan.goals || []).filter(
                            g => g.status !== 'completed'
                          ).length === 0 && (
                            <span className="text-xs text-zinc-500">
                              No active goals
                            </span>
                          )}
                        </div>
                      </div>
                      {developmentPlan.description && (
                        <div>
                          <h5 className="text-sm font-medium text-zinc-400 mb-2">
                            Description
                          </h5>
                          <p className="text-sm text-zinc-300">
                            {developmentPlan.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">
                      No development plan created yet
                    </p>
                    <p className="text-sm text-zinc-500">
                      Create a development plan to track this player's progress
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

        {/* RIGHT PANE: Recent Observations */}
        <div
          className="w-1/3 border-l border-zinc-800 p-6 bg-black flex flex-col min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">
            Recent Observations
          </h2>

          {selectedPlayer ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              {playerObservations.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                  <p className="text-zinc-400 text-sm">No observations yet</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Observations will appear here
                  </p>
                </div>
              ) : (
                playerObservations.slice(0, 5).map(observation => (
                  <div
                    key={observation.id}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">
                        {observation.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getRatingStars(observation.rating)}
                      </div>
                    </div>
                    <p className="text-zinc-400 text-xs mb-2 line-clamp-2">
                      {observation.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        {new Date(observation.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">
                Select a player to view their observations
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddPlayerModal && (
        <AddPlayerModal
          isOpen={showAddPlayerModal}
          onClose={() => setShowAddPlayerModal(false)}
          onSubmit={handleAddPlayerSubmit}
          teams={teams}
        />
      )}

      {showDeletePlayerModal && (
        <UniversalModal.Confirm
          open={showDeletePlayerModal}
          onOpenChange={setShowDeletePlayerModal}
          title="Delete Player"
          description={`Are you sure you want to delete ${selectedPlayer?.name}? This action cannot be undone.`}
          confirmText="Delete Player"
          onConfirm={handleDeletePlayerConfirm}
          onCancel={() => setShowDeletePlayerModal(false)}
          variant="danger"
        />
      )}

      {showArchivePlanModal && (
        <ArchivePlanModal
          isOpen={showArchivePlanModal}
          onClose={() => setShowArchivePlanModal(false)}
          onConfirm={handleArchivePlanConfirm}
        />
      )}
    </div>
  );
}
