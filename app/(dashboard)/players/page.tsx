'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Shield } from 'lucide-react';
import UniversalButton from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import PlayerListCard, {
  type Player as SharedPlayer,
} from '@/components/basketball/PlayerListCard';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { Capability } from '@/lib/db/role-types';

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

export default function PlayersPage() {
  // Role-based access control
  const { hasCapability } = useUserRole();

  // Normalized state pattern - industry standard
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<
    (SharedPlayer & { team: string }) | null
  >(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [developmentPlan, setDevelopmentPlan] =
    useState<DevelopmentPlan | null>(null);
  const [loadingDevelopmentPlan, setLoadingDevelopmentPlan] = useState(false);
  // State for all players (no infinite scroll)
  const [allPlayersById, setAllPlayersById] = useState<
    Record<string, SharedPlayer & { team: string }>
  >({});
  const [allPlayerIds, setAllPlayerIds] = useState<string[]>([]);
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
        // For now, just set teams directly
        if (Array.isArray(arr)) {
          const uniqueTeams = Array.from(
            new Map(arr.map((team: any) => [team.id, team])).values()
          );
          uniqueTeams.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setTeams(uniqueTeams);
        } else {
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
          // For now, just set observations directly
          setObservations(data.observations || []);
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
  }, [hasFetchedInitialData]); // Removed fetchAllPlayers from dependencies to prevent infinite loop

  // Remove useEffect for team filter changes and search reset
  // Remove any logic referencing teamFilter, setSearchTerm, loadingTeamPlayers

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
    <DashboardLayout
      left={
        <PlayerListCard
          title="Players"
          players={allPlayerIds
            .map(id => allPlayersById[id])
            .filter(
              (player): player is SharedPlayer & { team: string } =>
                player !== undefined
            )}
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
          {/* Player Profile Header - Always visible */}
          <h2 className="text-xl font-bold text-[#d8cc97] mt-0 mb-6">
            Profile
          </h2>

          {selectedPlayer ? (
            <>
              {/* Player Profile Card */}
              <UniversalCard.Default
                size="lg"
                className="bg-zinc-900 border border-zinc-800"
              >
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
                      {hasCapability(Capability.EDIT_PLAYER) && (
                        <DropdownMenuItem
                          onClick={() => {
                            /* Edit player logic */
                          }}
                        >
                          Edit Player
                        </DropdownMenuItem>
                      )}
                      {hasCapability(Capability.EDIT_PLAYER) && (
                        <DropdownMenuSeparator />
                      )}
                      {hasCapability(Capability.EDIT_PLAYER) && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={handleDeletePlayer}
                        >
                          Delete Player
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </UniversalCard.Default>

              {/* Development Plan Header - Always visible */}
              <h2 className="text-xl font-bold text-[#d8cc97] mt-0 mb-6">
                Development Plan
              </h2>

              {/* Development Plan Section */}
              <UniversalCard.Default
                size="lg"
                className="bg-zinc-900 border border-zinc-800"
              >
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
                    {planView === 'active' &&
                      hasCapability(Capability.CREATE_DEVELOPMENT_PLAN) && (
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
                    <p className="text-zinc-400 mb-2">No archived plans</p>
                  </div>
                )}
              </UniversalCard.Default>
            </>
          ) : (
            /* Empty state card that maintains the same layout position and sizing */
            <UniversalCard.SelectPlayerState
              message="Choose a player from the left sidebar to view details and development plans."
              icon={<Shield className="h-16 w-16 text-zinc-600" />}
              className="min-h-[400px] flex items-center justify-center"
            />
          )}
        </div>
      }
      right={
        <div className="space-y-4">
          {/* Observations Header - Always visible */}
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
            /* Show observations list or nothing - no empty state card for empty lists */
            playerObservations.length > 0 && (
              <div className="space-y-4">
                {playerObservations.slice(0, 3).map(obs => (
                  <UniversalCard.Default
                    key={obs.id}
                    size="md"
                    className="bg-zinc-900 border border-zinc-800"
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
                  </UniversalCard.Default>
                ))}
              </div>
            )
          ) : (
            /* Empty state card for when no player is selected */
            <UniversalCard.EmptyState
              title="No observations yet"
              message="Select a player to view their observations."
              icon={<Shield className="h-16 w-16 text-zinc-600" />}
              className="min-h-[300px] flex items-center justify-center"
            />
          )}
        </div>
      }
    />
  );
}
