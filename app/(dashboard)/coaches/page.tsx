'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Edit,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { z } from 'zod';

// Zod schemas for validation
const CoachSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  team: z.string(),
  playersCount: z.number(),
  status: z.enum(['active', 'inactive']),
  role: z.string(),
  experience: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const CoachesArraySchema = z.array(CoachSchema);

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  status: z.string(),
});
const PlayersArraySchema = z.array(PlayerSchema);

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
});
const TeamsArraySchema = z.array(TeamSchema);

// Types for coaches
interface Coach {
  id: string;
  name: string;
  email: string;
  team: string;
  playersCount: number;
  status: 'active' | 'inactive';
  role: string;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

interface Player {
  id: string;
  name: string;
  team: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
}

// Main component
export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state for coaches
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Player/team data for left column
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Filter coaches by selected team
  const filteredCoaches = selectedCoachId
    ? coaches.filter(coach => coach.id === selectedCoachId)
    : coaches;

  const filteredCoachesList = coaches.filter(coach => {
    const matchesSearch = coach.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || coach.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  // Handle coach selection with toggle functionality
  const handleCoachSelect = (coachId: string) => {
    if (selectedCoachId === coachId) {
      // Clicking the same coach again - show all coaches
      setSelectedCoachId(null);
    } else {
      // Clicking a different coach - filter to their details
      setSelectedCoachId(coachId);
    }
  };

  // Fetch real data with validation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock coaches data with validation - in real app, this would come from API
        const mockCoaches: Coach[] = [
          {
            id: '1',
            name: 'Coach Johnson',
            email: 'coach.johnson@example.com',
            team: 'Varsity Boys',
            playersCount: 12,
            status: 'active',
            role: 'Head Coach',
            experience: 8,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
          },
          {
            id: '2',
            name: 'Coach Smith',
            email: 'coach.smith@example.com',
            team: 'JV Girls',
            playersCount: 15,
            status: 'active',
            role: 'Assistant Coach',
            experience: 5,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
          },
          {
            id: '3',
            name: 'Coach Davis',
            email: 'coach.davis@example.com',
            team: 'Freshman Boys',
            playersCount: 18,
            status: 'inactive',
            role: 'Head Coach',
            experience: 3,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
          },
        ];

        // Validate coaches data
        const validatedCoaches = CoachesArraySchema.safeParse(mockCoaches);
        if (!validatedCoaches.success) {
          console.error('Invalid coaches data:', validatedCoaches.error);
          throw new Error('Invalid coaches data received');
        }

        // Filter out any invalid coaches
        const validCoaches = validatedCoaches.data.filter(
          (coach): coach is Coach =>
            coach &&
            typeof coach === 'object' &&
            typeof coach.id === 'string' &&
            typeof coach.name === 'string' &&
            typeof coach.email === 'string' &&
            typeof coach.team === 'string' &&
            typeof coach.role === 'string' &&
            typeof coach.createdAt === 'string' &&
            typeof coach.updatedAt === 'string' &&
            coach.id.trim() !== '' &&
            coach.name.trim() !== '' &&
            coach.email.trim() !== '' &&
            coach.team.trim() !== '' &&
            coach.role.trim() !== '' &&
            coach.createdAt.trim() !== '' &&
            coach.updatedAt.trim() !== ''
        );

        // Deduplicate coaches by id
        const uniqueCoaches = Array.from(
          new Map(validCoaches.map(coach => [coach.id, coach])).values()
        );
        setCoaches(uniqueCoaches);

        // Fetch players with validation
        const playersResponse = await fetch(
          '/api/dashboard/players?offset=0&limit=10'
        );
        if (playersResponse.ok) {
          const rawPlayersData = await playersResponse.json();
          // Handle the API response structure: { players: [...], total: number }
          if (
            rawPlayersData &&
            rawPlayersData.players &&
            Array.isArray(rawPlayersData.players)
          ) {
            const transformedRawPlayers = rawPlayersData.players.map(
              (player: any) => ({
                id: player.id,
                name: player.name || 'Unknown Player',
                team: player.team || 'No Team',
                status: player.status || 'active',
              })
            );

            // Validate players data
            const validatedPlayers = PlayersArraySchema.safeParse(
              transformedRawPlayers
            );
            if (!validatedPlayers.success) {
              console.error('Invalid players data:', validatedPlayers.error);
              throw new Error('Invalid players data received');
            }

            // Filter out any invalid players
            const validPlayers = validatedPlayers.data.filter(
              (player): player is Player =>
                player &&
                typeof player === 'object' &&
                typeof player.id === 'string' &&
                typeof player.name === 'string' &&
                typeof player.team === 'string' &&
                player.id.trim() !== '' &&
                player.name.trim() !== '' &&
                player.team.trim() !== ''
            );

            // Deduplicate players by id
            const uniquePlayers = Array.from(
              new Map(validPlayers.map(player => [player.id, player])).values()
            );
            setPlayers(uniquePlayers);
          } else {
            console.error(
              'Invalid API response structure for players:',
              rawPlayersData
            );
            setPlayers([]);
          }
        }

        // Fetch teams with validation
        const teamsResponse = await fetch('/api/user/teams');
        if (teamsResponse.ok) {
          const rawTeamsData = await teamsResponse.json();

          // Validate teams data
          const validatedTeams = TeamsArraySchema.safeParse(rawTeamsData);
          if (!validatedTeams.success) {
            console.error('Invalid teams data:', validatedTeams.error);
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

        if (uniqueCoaches.length > 0 && uniqueCoaches[0]) {
          setSelectedCoach(uniqueCoaches[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setCoaches([]);
        setPlayers([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset page when coach selection changes
  useEffect(() => {
    setPage(1);
  }, [selectedCoachId]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">
            Loading coaches...
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
        {/* LEFT PANE: Coach List */}
        <div
          className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Coaches
          </h2>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>

          {/* Team Filter */}
          <div className="relative mb-6">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <button
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className="w-full pl-10 pr-4 py-3 text-left bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
            >
              <span>{teamFilter === 'all' ? 'All Teams' : teamFilter}</span>
              {isTeamDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {isTeamDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setTeamFilter('all');
                    setIsTeamDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white"
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
                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white"
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coach List */}
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredCoachesList.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No coaches found
              </div>
            ) : (
              filteredCoachesList.map(coach => (
                <div
                  key={coach.id}
                  onClick={() => handleCoachSelect(coach.id)}
                  className={`p-4 rounded cursor-pointer transition-all ${
                    selectedCoachId === coach.id
                      ? 'bg-[#d8cc97] text-black font-semibold'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <p className="font-medium">{coach.name}</p>
                  <p className="text-xs text-gray-400">
                    {coach.playersCount} players • {coach.team}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANE: Coach Details */}
        <div
          className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedCoachId
              ? `${coaches.find(c => c.id === selectedCoachId)?.name}'s Profile`
              : 'All Coaches'}
          </h2>

          {selectedCoach ? (
            <div className="space-y-6">
              {/* Coach Profile Card */}
              <div
                className="bg-zinc-800 p-6 rounded"
                style={{ background: '#181818' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#d8cc97]">
                      {selectedCoach.name}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {selectedCoach.role}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-400">Email</p>
                    <p className="text-white">{selectedCoach.email}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Team</p>
                    <p className="text-white">{selectedCoach.team}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Experience</p>
                    <p className="text-white">
                      {selectedCoach.experience} years
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Status</p>
                    <p
                      className={`text-white ${selectedCoach.status === 'active' ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {selectedCoach.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Players */}
              <div
                className="bg-zinc-800 p-6 rounded"
                style={{ background: '#181818' }}
              >
                <h4 className="text-base font-bold text-[#d8cc97] mb-4">
                  Assigned Players ({selectedCoach.playersCount})
                </h4>
                <div className="space-y-2">
                  {players
                    .filter(p => p.team === selectedCoach.team)
                    .slice(0, 5)
                    .map(player => (
                      <div
                        key={player.id}
                        className="flex justify-between items-center p-2 bg-zinc-700 rounded"
                      >
                        <span className="text-sm text-white">
                          {player.name}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {player.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Select a coach to view details.
            </div>
          )}
        </div>

        {/* RIGHT PANE: Coach Insights */}
        <div
          className="w-1/4 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Insights
          </h2>

          {/* Coach Performance Metrics */}
          <div className="bg-zinc-800 p-6 rounded mb-6">
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Total Players</span>
                <span className="text-sm text-white font-semibold">
                  {coaches.reduce((sum, coach) => sum + coach.playersCount, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Active Coaches</span>
                <span className="text-sm text-white font-semibold">
                  {coaches.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Teams Covered</span>
                <span className="text-sm text-white font-semibold">
                  {teams.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-800 p-6 rounded">
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-[#d8cc97] text-black rounded text-sm font-semibold hover:bg-[#b3a14e] transition-colors">
                Add New Coach
              </button>
              <button className="w-full p-3 bg-zinc-700 text-white rounded text-sm font-semibold hover:bg-zinc-600 transition-colors">
                Assign Coach to Team
              </button>
              <button className="w-full p-3 bg-zinc-700 text-white rounded text-sm font-semibold hover:bg-zinc-600 transition-colors">
                View Coach Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
