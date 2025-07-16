'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Shield, Calendar } from 'lucide-react';
import { UniversalButton } from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import PlayerListCard, {
  type Player as SharedPlayer,
} from '@/components/basketball/PlayerListCard';
import Link from 'next/link';

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
  const [page] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Player/team data for left column - EXACT SAME AS PLAYERS PAGE
  const [teams, setTeams] = useState<any[]>([]); // Changed to any[] as per new_code
  const [selectedPlayer, setSelectedPlayer] = useState<
    (SharedPlayer & { team: string }) | null
  >(null);
  // State for infinite scroll (All Teams)
  const [allPlayersById, setAllPlayersById] = useState<
    Record<string, SharedPlayer & { team: string }>
  >({});
  const [allPlayerIds, setAllPlayerIds] = useState<string[]>([]);

  // Development plans state
  const [allDevelopmentPlans, setAllDevelopmentPlans] = useState<
    DevelopmentPlan[]
  >([]);

  // Check if a player has a development plan
  const hasDevelopmentPlan = (playerId: string) =>
    allDevelopmentPlans.some(plan => plan.playerId === playerId);

  // Date range filter logic
  const filteredByDate = observations.filter(obs => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const obsDate = new Date(obs.date);
    return obsDate >= dateRange.from && obsDate <= dateRange.to;
  });

  // Pagination logic
  const paginatedObservations =
    page * 25 // Assuming pageSize is 25 for now, as it's not defined in the original file
      ? filteredByDate.slice((page - 1) * 25, page * 25)
      : filteredByDate;

  // Handler for selecting a player - EXACT SAME AS PLAYERS PAGE
  const handlePlayerSelect = (player: SharedPlayer & { team: string }) => {
    setSelectedPlayer(player);
  };

  // Infinite scroll fetch for All Teams
  // Fetch all players (no infinite scroll)
  const fetchAllPlayers = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/players?limit=1000');
      const data = await response.json();
      if (data.players) {
        const transformedPlayers = data.players.map((player: any) => ({
          id: player.id,
          name: player.name || 'Unknown Player',
          team: player.team || 'No Team',
          status: player.status || 'active',
        })) as (SharedPlayer & { team: string })[];
        // Reset the list with all players
        const playersMap: Record<string, SharedPlayer & { team: string }> = {};
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
      }
    } catch (error) {
      console.error('Error fetching all players:', error);
    }
  }, []);

  // Fetch development plans
  const fetchDevelopmentPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/development-plans');
      if (response.ok) {
        const plans = await response.json();
        setAllDevelopmentPlans(plans);
      }
    } catch (error) {
      console.error('Error fetching development plans:', error);
    }
  }, []);

  // No infinite scroll - all players loaded at once
  // Determine which player list to use
  const playersToShow = allPlayerIds;
  const playersByIdToUse = allPlayersById;

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
        .includes(player.name.toLowerCase()); // This line was removed as per new_code
      return matchesSearch; // Team filter is already applied by the data source
    });

  // Sort players alphabetically
  const sortedPlayers = [...filteredPlayers].sort((a, b) =>
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
        if (Array.isArray(arr)) {
          // Deduplicate teams by id
          const uniqueTeams = Array.from(
            new Map(arr.map((team: any) => [team.id, team])).values()
          );
          uniqueTeams.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setTeams(uniqueTeams);
        } else {
          console.error('Invalid teams data format');
          setTeams([]);
        }
      })
      .catch(error => {
        console.error('Error fetching teams:', error);
        setTeams([]);
      });
    // Fetch initial players for All Teams
    fetchAllPlayers();
    fetchDevelopmentPlans(); // Fetch development plans
  }, [fetchAllPlayers, fetchDevelopmentPlans]);

  // Remove the problematic useEffect and any unused variables/functions
  // PlayerListCard now handles all filtering and selection logic

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
    <DashboardLayout
      left={
        <PlayerListCard
          title="Players"
          players={sortedPlayers}
          selectedPlayerId={selectedPlayer?.id || undefined}
          onPlayerSelect={player =>
            handlePlayerSelect(player as SharedPlayer & { team: string })
          }
          hasDevelopmentPlan={hasDevelopmentPlan}
          showSearch={true}
          showTeamFilter={true}
          allTeams={teams}
          maxHeight="calc(100vh - 200px)"
        />
      }
      center={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#d8cc97]">Observations</h2>
            <div className="flex gap-2">
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <UniversalButton.Secondary size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Filter by Date
                  </UniversalButton.Secondary>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <UniversalButton.Primary size="sm">
                <Link href="/observations/wizard">Add Observation</Link>
              </UniversalButton.Primary>
            </div>
          </div>

          {observations.length === 0 ? (
            <UniversalCard.Default
              size="lg"
              className="bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center h-96"
            >
              <Shield className="text-zinc-700 w-20 h-20 mb-5" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Observations Found
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                No observations are currently available.
              </p>
            </UniversalCard.Default>
          ) : (
            <div className="space-y-4">
              {paginatedObservations.map(obs => (
                <UniversalCard.Default
                  key={obs.id}
                  size="lg"
                  className="bg-zinc-900 border border-zinc-800"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {obs.title}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {obs.playerName} •{' '}
                        {new Date(obs.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-zinc-500">
                        Rating: {obs.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 mb-4">
                    {obs.description}
                  </p>
                  {obs.tags && obs.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {obs.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </UniversalCard.Default>
              ))}
            </div>
          )}
        </div>
      }
      right={
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">Quick Stats</h2>

          <UniversalCard.Default
            size="md"
            className="bg-zinc-800/50 border border-zinc-700"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="text-[#d8cc97] w-4 h-4" />
              <h4 className="font-medium text-white">Observation Summary</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Observations:</span>
                <span className="text-white font-medium">
                  {totalObservations}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">This Month:</span>
                <span className="text-white font-medium">
                  {
                    observations.filter(obs => {
                      const obsDate = new Date(obs.date);
                      const now = new Date();
                      return (
                        obsDate.getMonth() === now.getMonth() &&
                        obsDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Average Rating:</span>
                <span className="text-white font-medium">
                  {observations.length > 0
                    ? (
                        observations.reduce((sum, obs) => sum + obs.rating, 0) /
                        observations.length
                      ).toFixed(1)
                    : '0.0'}
                </span>
              </div>
            </div>
          </UniversalCard.Default>

          {selectedPlayer && (
            <UniversalCard.Default
              size="md"
              className="bg-zinc-800/50 border border-zinc-700"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="text-[#d8cc97] w-4 h-4" />
                <h4 className="font-medium text-white">Player Stats</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Player:</span>
                  <span className="text-white font-medium">
                    {selectedPlayer.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Observations:</span>
                  <span className="text-white font-medium">
                    {
                      observations.filter(
                        obs => obs.playerId === selectedPlayer.id
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Development Plan:</span>
                  <span className="text-white font-medium">
                    {hasDevelopmentPlan(selectedPlayer.id) ? 'Active' : 'None'}
                  </span>
                </div>
              </div>
            </UniversalCard.Default>
          )}
        </div>
      }
    />
  );
}
