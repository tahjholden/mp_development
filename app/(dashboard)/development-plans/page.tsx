'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Target, Zap, Lightbulb, Shield, Search, Filter } from 'lucide-react';
import { UniversalButton } from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';
import PlayerListCard, {
  type PlayerStatus,
} from '@/components/basketball/PlayerListCard';

// Define Player type locally to match the actual data structure
interface Player {
  id: string;
  name: string;
  team: string;
  status: PlayerStatus;
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
    console.log('Selected player IDs changed:', selectedPlayerIds);
    if (selectedPlayerIds.length > 0) {
      fetchPlansAndSuggestions(selectedPlayerIds);
    } else {
      setSuggestions({ drills: [], constraints: [], combined: [] });
    }
  }, [selectedPlayerIds]);

  // NEW: Function to fetch plans and suggestions
  const fetchPlansAndSuggestions = async (playerIds: string[]) => {
    try {
      console.log('Fetching suggestions for player IDs:', playerIds);

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
      console.log('Suggestions response status:', suggestionsResponse.status);

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        console.log('Suggestions data received:', suggestionsData);
        setSuggestions(suggestionsData);
      } else {
        console.error(
          'Suggestions API error:',
          suggestionsResponse.status,
          suggestionsResponse.statusText
        );
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
          // Filter out any invalid teams and deduplicate by id
          const validTeams = rawTeamsData.filter(
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

  // Fetch all players (no infinite scroll)
  const fetchAllPlayers = useCallback(async () => {
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
      // setAllLoadingPlayers(false); // This line is removed
    }
  }, []);

  // Fetch all players on mount or when All Teams is selected
  useEffect(() => {
    if (playerIds.length === 0) { // Assuming playerIds is the source of truth for selected players
      fetchAllPlayers();
    }
  }, [playerIds, fetchAllPlayers]);

  // Player list rendering logic
  const sortedAllPlayers = [...allPlayerIds.map(id => allPlayersById[id])]
    .filter((player): player is Player => !!player && !!player.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const sortedTeamPlayers = [...playerIds.map(id => playersById[id])]
    .filter((player): player is Player => !!player && !!player.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const playersToShow =
    playerIds.length === 0 ? sortedAllPlayers : sortedTeamPlayers;

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
    <DashboardLayout
      left={
        <PlayerListCard
          title="Players"
          players={playersToShow as any}
          selectedPlayerIds={selectedPlayerIds}
          onPlayerSelect={player => handlePlayerSelect(player as any)}
          hasDevelopmentPlan={hasDevelopmentPlan}
          multiSelect={true}
          showSearch={true}
          showTeamFilter={true}
          allTeams={teams}
          maxHeight="calc(100vh - 200px)"
        />
      }
      center={
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
            <UniversalCard.Default
              size="lg"
              className="bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center h-96"
            >
              <Target className="text-zinc-700 w-20 h-20 mb-5" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Development Plans Found
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                No development plans are currently available for the players.
              </p>
            </UniversalCard.Default>
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
                <UniversalCard.Default
                  size="lg"
                  className="bg-zinc-900 border border-zinc-800 text-center"
                >
                  <Target className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-2">
                    No development plans found for selected players
                  </p>
                  <p className="text-sm text-zinc-500">
                    Create development plans to track player progress
                  </p>
                </UniversalCard.Default>
              )}
            </div>
          )}
        </div>
      }
      right={
        <div className="space-y-4">
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
              <UniversalCard.Default
                size="md"
                className="bg-zinc-800/50 border border-zinc-700"
              >
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
                  <p className="text-sm text-zinc-400">
                    No active development plans
                  </p>
                )}
              </UniversalCard.Default>

              {/* Drill Suggestions */}
              <UniversalCard.Default
                size="md"
                className="bg-zinc-800/50 border border-zinc-700"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="text-[#d8cc97] w-4 h-4" />
                  <h4 className="font-medium text-white">Recommended Drills</h4>
                </div>
                {suggestions.drills && suggestions.drills.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.drills.slice(0, 3).map(drill => (
                      <div
                        key={drill.id}
                        className="bg-zinc-700/50 rounded p-3"
                      >
                        <p className="text-sm text-white font-medium">
                          {drill.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {drill.duration} min • {drill.difficulty}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-zinc-700/50 rounded p-3">
                      <p className="text-sm text-white font-medium">
                        Shooting Form Drill
                      </p>
                      <p className="text-xs text-zinc-400">
                        15 min • intermediate
                      </p>
                    </div>
                    <div className="bg-zinc-700/50 rounded p-3">
                      <p className="text-sm text-white font-medium">
                        Ball Handling Circuit
                      </p>
                      <p className="text-xs text-zinc-400">20 min • beginner</p>
                    </div>
                  </div>
                )}
              </UniversalCard.Default>
            </div>
          ) : (
            // Group suggestions
            <div className="space-y-6">
              <UniversalCard.Default
                size="md"
                className="bg-zinc-800/50 border border-zinc-700"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="text-[#d8cc97] w-4 h-4" />
                  <h4 className="font-medium text-white">
                    Group Practice Ideas
                  </h4>
                </div>
                <p className="text-sm text-zinc-400">
                  Team drills and group activities for{' '}
                  {selectedPlayerIds.length} players
                </p>
              </UniversalCard.Default>
            </div>
          )}
        </div>
      }
    />
  );
}
