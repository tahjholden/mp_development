'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Plus } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { DateRange } from 'react-day-picker';
import type { Player as SharedPlayer } from '@/components/basketball/PlayerListCard';
import { z } from 'zod';

// Types for observations (matching actual API response)
interface Observation {
  id: string;
  playerId: string;
  playerFirstName?: string;
  playerLastName?: string;
  playerName: string;
  title: string;
  description: string;
  rating: number;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string | null;
}

// Main component
export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [totalObservations, setTotalObservations] = useState<number>(0);
  const [obsOffset, setObsOffset] = useState(0);
  const [obsLoadingMore, setObsLoadingMore] = useState(false);
  const obsLimit = 20;
  const obsListRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state for observations
  const [pageSize, setPageSize] = useState<number | 'all'>(25);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Player/team data for left column - EXACT SAME AS PLAYERS PAGE
  const [playersById, setPlayersById] = useState<
    Record<string, SharedPlayer & { team: string }>
  >({});
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [teams, setTeams] = useState<any[]>([]); // Changed to any[] as per new_code
  const [selectedPlayer, setSelectedPlayer] = useState<
    (SharedPlayer & { team: string }) | null
  >(null);

  // Infinite scroll state - EXACT SAME AS PLAYERS PAGE
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Search and filter state - EXACT SAME AS PLAYERS PAGE
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Date range filter logic
  const filteredByDate = observations.filter(obs => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const obsDate = new Date(obs.date);
    return obsDate >= dateRange.from && obsDate <= dateRange.to;
  });

  // Pagination logic
  const paginatedObservations =
    pageSize === 'all'
      ? filteredByDate
      : filteredByDate.slice((page - 1) * pageSize, page * pageSize);
  const totalPages =
    pageSize === 'all'
      ? 1
      : Math.ceil(filteredByDate.length / (pageSize as number));

  // Handler for selecting a player - EXACT SAME AS PLAYERS PAGE
  const handlePlayerSelect = (player: SharedPlayer & { team: string }) => {
    setSelectedPlayer(player);
  };

  // Fetch players with pagination - EXACT SAME AS PLAYERS PAGE
  const fetchPlayers = useCallback(
    async (currentOffset: number = 0, reset: boolean = false) => {
      setLoadingPlayers(true);
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
          })) as (SharedPlayer & { team: string })[];

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

            setPlayersById(playersMap);
            setPlayerIds(ids);
            setOffset(10);
          } else {
            // Append to existing list with normalized state
            setPlayersById(prevPlayersById => {
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

              setPlayerIds(prevIds => [...prevIds, ...newIds]);
              return newPlayersById;
            });
            setOffset(prev => prev + 10);
          }

          setHasMore(data.players.length === 10);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoadingPlayers(false);
      }
    },
    []
  );

  // Load more players when scrolling - EXACT SAME AS PLAYERS PAGE
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        !loadingPlayers &&
        hasMore
      ) {
        fetchPlayers(offset);
      }
    },
    [fetchPlayers, loadingPlayers, hasMore, offset]
  );

  // Filter players based on search and team filter - EXACT SAME AS PLAYERS PAGE
  const filteredPlayers = playerIds
    .map(id => playersById[id])
    .filter(
      (
        player: (SharedPlayer & { team: string }) | undefined
      ): player is SharedPlayer & { team: string } => !!player && !!player.id
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

  // Load more observations when scrolling
  const handleObsScroll = async () => {
    if (!showDatePicker || obsLoadingMore) return;
    const el = obsListRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 64) {
      // Near bottom, fetch more if available
      if (observations.length < totalObservations) {
        setObsLoadingMore(true);
        try {
          const res = await fetch(
            `/api/observations?offset=${obsOffset}&limit=${obsLimit}`
          );
          if (res.ok) {
            const data = await res.json();
            setObservations(prev => [...prev, ...data.observations]);
            setObsOffset(prev => prev + data.observations.length);
          }
        } finally {
          setObsLoadingMore(false);
        }
      }
    }
  };

  // Fetch real data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial observations with pagination
        const observationsResponse = await fetch(
          `/api/observations?offset=0&limit=${obsLimit}`
        );
        if (!observationsResponse.ok) {
          throw new Error('Failed to fetch observations');
        }
        const { observations: obsArr, total } =
          await observationsResponse.json();
        setObservations(obsArr);
        setTotalObservations(total);
        setObsOffset(obsArr.length);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setObservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch initial players and teams - EXACT SAME AS PLAYERS PAGE
  useEffect(() => {
    // Fetch teams
    fetch('/api/user/teams')
      .then(res => {
        if (!res.ok) {
          console.log('Teams API returned error status:', res.status);
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
        const result = z
          .array(z.object({ id: z.string(), name: z.string() }))
          .safeParse(arr);
        if (result.success) {
          // Deduplicate teams by id
          const uniqueTeams = Array.from(
            new Map(result.data.map(team => [team.id, team])).values()
          );
          uniqueTeams.sort((a, b) => a.name.localeCompare(b.name));
          setTeams(uniqueTeams);
        } else {
          console.error('Zod validation error for teams:', result.error);
          setTeams([]);
        }
      })
      .catch(error => {
        console.error('Error fetching teams:', error);
        setTeams([]);
      });

    // Fetch initial players
    setLoadingPlayers(true);
    fetch('/api/dashboard/players?offset=0&limit=10')
      .then(res => {
        if (!res.ok) {
          console.log('Players API returned error status:', res.status);
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
          })) as (SharedPlayer & { team: string })[];

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

          setPlayersById(playersMap);
          setPlayerIds(ids);
          setOffset(10);
          setHasMore(data.players.length === 10);
        }
      })
      .catch(error => {
        console.error('Error fetching players:', error);
      })
      .finally(() => {
        setLoadingPlayers(false);
      });
  }, []);

  // Reset pagination when search or filter changes - EXACT SAME AS PLAYERS PAGE
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchPlayers(0, true);
  }, [searchTerm, teamFilter]);

  // Reset page when player selection changes
  useEffect(() => {
    setPage(1);
  }, [selectedPlayer]);

  // Infinite scroll handler for expanded observations list
  const handleObsScrollLoad = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      !obsLoadingMore &&
      observations.length < totalObservations
    ) {
      handleObsScroll();
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">
            Loading observations...
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
      {/* Main Content */}
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
            <Button
              size="sm"
              onClick={() => {}}
              className="bg-[#d8cc97] text-black hover:bg-[#d8cc97]/80"
            >
              <Plus size={16} className="mr-1" />
              Add Player
            </Button>
          </div>
          {/* Search Input */}
          <div className="relative mb-6">
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
              sortedPlayers.map((player: SharedPlayer & { team: string }) => (
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
                      <p className="text-sm text-zinc-400">
                        {String(player.team)}
                      </p>
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

        {/* CENTER PANE: Observations */}
        <div
          className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <div className="flex items-center mb-6 gap-4 justify-between w-full">
            <h2 className="text-xl font-bold text-[#d8cc97] mt-0">
              {selectedPlayer
                ? `${selectedPlayer.name}'s Observations`
                : 'All Observations'}
            </h2>
            <div className="flex items-center gap-4">
              {/* Page size selector */}
              <label className="text-sm text-zinc-400">
                Show:
                <select
                  className="ml-2 px-2 py-1 rounded bg-zinc-800 text-white border border-zinc-700"
                  value={pageSize}
                  onChange={e => {
                    setPageSize(
                      e.target.value === 'all' ? 'all' : Number(e.target.value)
                    );
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </select>
              </label>
              {/* Date range picker toggle */}
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-3 py-1 border border-zinc-700 bg-zinc-800 text-[#d8cc97] hover:border-[#d8cc97]"
                  >
                    {dateRange?.from && dateRange?.to
                      ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                      : 'Select Date Range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4 bg-black border-[#d8cc97] text-[#d8cc97] w-auto">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="bg-black text-[#d8cc97]"
                  />
                  <Button
                    variant="ghost"
                    className="w-full mt-2 border border-[#d8cc97] text-[#d8cc97] hover:bg-[#232323]"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Close
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {paginatedObservations.length > 0 ? (
            <div
              ref={obsListRef}
              className="space-y-4"
              style={{
                maxHeight: `${(pageSize === 'all' ? 12 : pageSize) * 64}px`,
                minHeight: '0',
                overflowY:
                  paginatedObservations.length >
                  (pageSize === 'all' ? 12 : pageSize)
                    ? 'auto'
                    : 'visible',
              }}
              onScroll={handleObsScrollLoad}
            >
              {paginatedObservations.map(obs => (
                <div
                  key={obs.id}
                  className="bg-zinc-800 px-6 py-3 rounded transition-all"
                  style={{ background: '#181818' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <div className="text-base font-bold text-[#d8cc97]">
                        {obs.playerName}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {new Date(obs.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="text-xs text-[#d8cc97] font-semibold hover:underline bg-transparent"
                        style={{ background: 'transparent' }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-red-400 font-semibold hover:underline bg-transparent"
                        style={{ background: 'transparent' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-3">
                    {obs.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              {selectedPlayer
                ? 'No observations found for this player.'
                : 'No observations found.'}
            </div>
          )}
          {/* Pagination controls */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="px-2 py-1 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Insights */}
        <div
          className="w-1/4 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Insights
          </h2>

          {/* Teaser Feature Block */}
          <div className="bg-zinc-800 p-6 rounded">
            <div className="p-4 bg-zinc-900 rounded border border-dashed border-[#d8cc97]">
              <p className="text-sm text-[#d8cc97] font-semibold mb-3">
                🚀 Coming Soon to This Panel:
              </p>
              <ul className="text-sm text-gray-400 list-disc list-inside space-y-2">
                <li>AI-powered constraint suggestions</li>
                <li>Tag trend visualizations</li>
                <li>Drill recommendations based on this observation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
