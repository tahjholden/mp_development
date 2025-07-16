'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { z } from 'zod';

// Zod schemas for validation
const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  team: z.string(),
  type: z.enum([
    'Practice',
    'Game',
    'Training',
    'Meeting',
    'Workout',
    'Evaluation',
  ]),
  duration: z.number(),
  coach: z.string(),
  location: z.string(),
  description: z.string(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  attendance: z.number(),
  maxAttendance: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const SessionsArraySchema = z.array(SessionSchema);

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

// Types for sessions
interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  team: string;
  type: 'Practice' | 'Game' | 'Training' | 'Meeting' | 'Workout' | 'Evaluation';
  duration: number;
  coach: string;
  location: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendance: number;
  maxAttendance: number;
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
export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player/team data for left column
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Filter sessions by selected team
  const filteredSessionsList = sessions.filter(session => {
    const matchesSearch = session.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || session.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  // Handle session selection with toggle functionality
  const handleSessionSelect = (sessionId: string) => {
    if (selectedSessionId === sessionId) {
      // Clicking the same session again - show all sessions
      setSelectedSessionId(null);
    } else {
      // Clicking a different session - filter to their details
      setSelectedSessionId(sessionId);
    }
  };

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch sessions from API with validation
        const sessionsResponse = await fetch('/api/dashboard/sessions');
        let transformedSessions: Session[] = [];
        if (sessionsResponse.ok) {
          const rawSessionsData = await sessionsResponse.json();

          // Transform the raw data to match our schema
          const transformedRawSessions = rawSessionsData.map(
            (session: any) => ({
              id: session.id,
              title: session.title,
              date: session.date,
              time: session.time,
              team: session.team,
              type: session.type,
              duration: 90, // Default duration
              coach: 'Coach Johnson', // Default coach
              location: 'Main Gym',
              description: `${session.type} session for ${session.team}`,
              status: 'scheduled' as const,
              attendance: Math.floor(Math.random() * 20) + 5,
              maxAttendance: 25,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-15',
            })
          );

          // Validate sessions data
          const validatedSessions = SessionsArraySchema.safeParse(
            transformedRawSessions
          );
          if (!validatedSessions.success) {
            console.error('Invalid sessions data:', validatedSessions.error);
            throw new Error('Invalid sessions data received');
          }

          // Filter out any invalid sessions
          const validSessions = validatedSessions.data.filter(
            (session): session is Session =>
              session &&
              typeof session === 'object' &&
              typeof session.id === 'string' &&
              typeof session.title === 'string' &&
              typeof session.team === 'string' &&
              session.id.trim() !== '' &&
              session.title.trim() !== '' &&
              session.team.trim() !== ''
          );

          // Deduplicate sessions by id
          const uniqueSessions = Array.from(
            new Map(
              validSessions.map(session => [session.id, session])
            ).values()
          );
          setSessions(uniqueSessions);
          transformedSessions = uniqueSessions;
        }

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

        if (
          transformedSessions &&
          transformedSessions.length > 0 &&
          transformedSessions[0]
        ) {
          setSelectedSession(transformedSessions[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setSessions([]);
        setPlayers([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset page when session selection changes
  useEffect(() => {
    // setPage(1); // This line is removed
  }, [selectedSessionId]);

  if (loading) {
    return (
      <DashboardLayout
        left={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sessions</h2>
            </div>
          </div>
        }
        center={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading sessions...</p>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            {/* TODO: Port your right sidebar content here */}
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <DashboardLayout
        left={<div className="space-y-4"></div>}
        center={
          <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
              {error}
            </div>
          </div>
        }
        right={<div className="space-y-4"></div>}
      />
    );
  }

  return (
    <DashboardLayout
      left={
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Sessions
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

          {/* Session List */}
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredSessionsList.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No sessions found
              </div>
            ) : (
              filteredSessionsList.map(session => (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelect(session.id)}
                  className={`p-4 rounded cursor-pointer transition-all ${
                    selectedSessionId === session.id
                      ? 'bg-[#d8cc97] text-black font-semibold'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <p className="font-medium">{session.title}</p>
                  <p className="text-xs text-gray-400">
                    {session.date} • {session.time} • {session.team}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      }
      center={
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedSessionId
              ? `${sessions.find(s => s.id === selectedSessionId)?.title}`
              : 'All Sessions'}
          </h2>

          {selectedSession ? (
            <div className="space-y-6">
              {/* Session Details Card */}
              <UniversalCard.Default
                title={selectedSession.title}
                subtitle={selectedSession.type}
                size="lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#d8cc97]">
                      {selectedSession.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {selectedSession.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <UniversalButton.Ghost size="xs">
                      Edit
                    </UniversalButton.Ghost>
                    <UniversalButton.Ghost
                      size="xs"
                      className="text-red-400 hover:text-red-300"
                    >
                      Cancel
                    </UniversalButton.Ghost>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-zinc-400">Date & Time</p>
                    <p className="text-white">
                      {selectedSession.date} at {selectedSession.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Team</p>
                    <p className="text-white">{selectedSession.team}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Duration</p>
                    <p className="text-white">
                      {selectedSession.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Location</p>
                    <p className="text-white">{selectedSession.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Description</p>
                  <p className="text-white text-sm">
                    {selectedSession.description}
                  </p>
                </div>
              </UniversalCard.Default>

              {/* Attendance */}
              <UniversalCard.Default
                title={`Attendance (${selectedSession.attendance}/${selectedSession.maxAttendance})`}
                size="lg"
              >
                <div className="space-y-2">
                  {players
                    .filter(p => p.team === selectedSession.team)
                    .slice(0, 5)
                    .map(player => (
                      <div
                        key={player.id}
                        className="flex justify-between items-center p-2 bg-zinc-700 rounded"
                      >
                        <span className="text-sm text-white">
                          {player.name}
                        </span>
                        <span className="text-xs text-green-400">Present</span>
                      </div>
                    ))}
                </div>
              </UniversalCard.Default>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Select a session to view details.
            </div>
          )}
        </div>
      }
      right={
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Planning
          </h2>

          {/* Quick Session Creation */}
          <UniversalCard.Default
            title="Quick Actions"
            size="sm"
            className="mb-6"
          >
            <div className="space-y-3">
              <UniversalButton.Primary className="w-full">
                Create New Session
              </UniversalButton.Primary>
              <UniversalButton.Secondary className="w-full">
                Schedule Practice
              </UniversalButton.Secondary>
              <UniversalButton.Secondary className="w-full">
                Plan Game Review
              </UniversalButton.Secondary>
            </div>
          </UniversalCard.Default>

          {/* Session Templates */}
          <UniversalCard.Default
            title="Session Templates"
            size="sm"
            className="mb-6"
          >
            <div className="space-y-3">
              <div className="p-3 bg-zinc-700 rounded cursor-pointer hover:bg-zinc-600 transition-colors">
                <p className="text-sm font-semibold text-white">
                  Shooting Practice
                </p>
                <p className="text-xs text-zinc-400">90 min • Focus on form</p>
              </div>
              <div className="p-3 bg-zinc-700 rounded cursor-pointer hover:bg-zinc-600 transition-colors">
                <p className="text-sm font-semibold text-white">
                  Defensive Drills
                </p>
                <p className="text-xs text-zinc-400">60 min • Footwork focus</p>
              </div>
              <div className="p-3 bg-zinc-700 rounded cursor-pointer hover:bg-zinc-600 transition-colors">
                <p className="text-sm font-semibold text-white">
                  Team Scrimmage
                </p>
                <p className="text-xs text-zinc-400">
                  120 min • Game simulation
                </p>
              </div>
            </div>
          </UniversalCard.Default>

          {/* Upcoming Sessions */}
          <UniversalCard.Default title="Upcoming" size="sm">
            <div className="space-y-3">
              {sessions.slice(0, 3).map(session => (
                <div key={session.id} className="p-3 bg-zinc-700 rounded">
                  <p className="text-sm font-semibold text-white">
                    {session.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {session.date} • {session.time}
                  </p>
                </div>
              ))}
            </div>
          </UniversalCard.Default>
        </div>
      }
    />
  );
}
