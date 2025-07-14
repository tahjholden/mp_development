'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
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
  const [playersById, setPlayersById] = useState<Record<string, SharedPlayer>>(
    {}
  );
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<SharedPlayer | null>(
    null
  );
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showDeletePlayerModal, setShowDeletePlayerModal] = useState(false);
  const [showArchivePlanModal, setShowArchivePlanModal] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Handler for adding a new player
  const handleAddPlayer = () => {
    setShowAddPlayerModal(true);
  };

  // Handler for selecting a player
  const handlePlayerSelect = (player: SharedPlayer) => {
    setSelectedPlayer(player);
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

  // Fetch players with pagination
  const fetchPlayers = useCallback(
    async (currentOffset: number = 0, reset: boolean = false) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/dashboard/players?offset=${currentOffset}&limit=10`
        );
        const data = await response.json();

        if (data.players) {
          const transformedPlayers = data.players.map((player: any) => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            team: player.team || 'No Team',
            status: player.status || 'active',
          }));

          if (reset) {
            // Reset the list with normalized state
            const playersMap: Record<string, SharedPlayer> = {};
            const ids: string[] = [];

            transformedPlayers.forEach((player: SharedPlayer) => {
              if (!playersMap[player.id]) {
                playersMap[player.id] = player;
                ids.push(player.id);
              }
            });

            setPlayersById(playersMap);
            setPlayerIds(ids);
            setOffset(10);
          } else {
            // Append to existing list with normalized state
            setPlayersById(prevPlayersById => {
              const newPlayersById = { ...prevPlayersById };
              const newIds: string[] = [];

              transformedPlayers.forEach((player: SharedPlayer) => {
                if (!newPlayersById[player.id]) {
                  newPlayersById[player.id] = player;
                  newIds.push(player.id);
                }
              });

              setPlayerIds(prevIds => [...prevIds, ...newIds]);
              return newPlayersById;
            });
            setOffset(prev => prev + 10);
          }

          // setHasMore(data.players.length === 10); // This line was removed by the linter
        }
      } catch (error) {
        // console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load more players when scrolling
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        !loading
      ) {
        fetchPlayers(offset);
      }
    },
    [fetchPlayers, loading, offset]
  );

  // Filter players based on search and team filter
  const filteredPlayers = playerIds
    .map(id => playersById[id])
    .filter(
      (player: SharedPlayer | undefined): player is SharedPlayer =>
        !!player && !!player.id
    )
    .filter(player => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
      return matchesSearch && matchesTeam;
    });
  // Deduplicate by player.id before sorting and rendering
  const dedupedPlayers = Array.from(
    new Map(filteredPlayers.map(p => [p.id, p])).values()
  );
  const sortedPlayers = [...dedupedPlayers].sort((a, b) =>
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

    // Fetch initial players
    setLoading(true);
    fetch('/api/dashboard/players?offset=0&limit=10')
      .then(res => {
        if (!res.ok) {
          // console.log('Players API returned error status:', res.status);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return; // Skip if no data (error case)

        if (data.players) {
          const transformedPlayers = data.players.map((player: any) => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            team: player.team || 'No Team',
            status: player.status || 'active',
          }));

          // Reset the list with normalized state
          const playersMap: Record<string, SharedPlayer> = {};
          const ids: string[] = [];

          transformedPlayers.forEach((player: SharedPlayer) => {
            if (!playersMap[player.id]) {
              playersMap[player.id] = player;
              ids.push(player.id);
            }
          });

          setPlayersById(playersMap);
          setPlayerIds(ids);
          setOffset(10);
        }
      })
      .catch(() => {
        // console.error('Error fetching players:', error);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch observations
    setLoading(true); // This line was removed by the linter
    // setErrorObservations(null); // This line was removed by the linter
    fetch('/api/observations')
      .then(res => {
        if (!res.ok) {
          // console.log('Observations API returned error status:', res.status);
          setObservations([]);
          // setErrorObservations('Failed to fetch observations'); // This line was removed by the linter
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
            // console.error(
            //   'Zod validation error for observations:',
            //   result.error
            // );
            setObservations([]);
            // setErrorObservations( // This line was removed by the linter
            //   'Invalid observations data received from API.'
            // );
          }
        } else {
          // console.error(
          //   'Invalid API response structure for observations:',
          //   data
          // );
          setObservations([]);
          // setErrorObservations( // This line was removed by the linter
          //   'Invalid observations data structure received from API.'
          // );
        }
      })
      .catch(() => {
        // console.error('Error fetching observations:', err);
        // setErrorObservations('Failed to fetch observations'); // This line was removed by the linter
      })
      .finally(() => setLoading(false)); // This line was removed by the linter
  }, []);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setOffset(0);

    fetchPlayers(0, true);
  }, [searchTerm, teamFilter]);

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
            <UniversalButton.Primary
              size="sm"
              onClick={handleAddPlayer}
              leftIcon={<Plus size={16} />}
            >
              Add Player
            </UniversalButton.Primary>
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
            {sortedPlayers.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No players found</p>
              </div>
            ) : (
              sortedPlayers.map((player: SharedPlayer) => (
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
                      <p className="font-medium text-white">{player.name}</p>
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

                <div className="text-center py-8">
                  <Shield className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-2">
                    No development plan created yet
                  </p>
                  <p className="text-sm text-zinc-500">
                    Create a development plan to track this player's progress
                  </p>
                </div>
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
