'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import CoachListCard, {
  type Coach as SharedCoach,
} from '@/components/basketball/CoachListCard';
// Types for coaches
// Types for coaches
interface Coach {
  id: string;
  name: string;
  email: string;
  team: string;
  teamId?: string;
  status: 'active' | 'inactive';
  role: string;
  experience: number;
  playerCount?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // For additional coach properties
}
interface Player {
  id: string;
  name?: string;
  displayName?: string;
  team?: string;
  status?: string;
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
  // Player/team data for left column
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [selectedCoachPlayers, setSelectedCoachPlayers] = useState<Player[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  // Filter coaches by selected team
  // const filteredCoaches = selectedCoachId
  //   ? coaches.filter(coach => coach.id === selectedCoachId)
  //   : coaches;
  const filteredCoachesList = coaches.filter(coach => {
    const matchesSearch = coach.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || coach.team === teamFilter;
    return matchesSearch && matchesTeam;
  });
  // Fetch coach players with validation (same pattern as teams page)
  const fetchCoachPlayers = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players`);
      if (!response.ok) throw new Error('Failed to fetch team players');
      const rawPlayersData = await response.json();
      // Filter out any invalid players
      const validPlayers = (rawPlayersData || []).filter(
        (player: any): player is Player =>
          player &&
          typeof player === 'object' &&
          typeof player.id === 'string' &&
          typeof player.displayName === 'string' &&
          player.id.trim() !== '' &&
          player.displayName.trim() !== ''
      );
      // Deduplicate players by id
      const uniquePlayers = Array.from(
        new Map(
          validPlayers.map((player: Player) => [player.id, player])
        ).values()
      );
      setSelectedCoachPlayers(uniquePlayers);
    } catch (error) {
      console.error('Error fetching team players:', error);
      setSelectedCoachPlayers([]);
    }
  };
  // Handle coach selection with toggle functionality
  const handleCoachSelect = async (coachId: string) => {
    if (selectedCoachId === coachId) {
      // Clicking the same coach again - show all coaches
      setSelectedCoachId(null);
      setSelectedCoach(null);
      setSelectedCoachPlayers([]);
    } else {
      // Clicking a different coach - filter to their details
      setSelectedCoachId(coachId);
      const coach = coaches.find(c => c.id === coachId);
      setSelectedCoach(coach || null);
      // Fetch players for this coach's team
      if (coach?.teamId) {
        fetchCoachPlayers(coach.teamId);
      } else {
        setSelectedCoachPlayers([]);
      }
    }
  };
  // Fetch real data with validation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch coaches from live API
        const coachesResponse = await fetch('/api/coaches');
        if (!coachesResponse.ok) throw new Error('Failed to fetch coaches');
        const rawCoachesData = await coachesResponse.json();
        // Filter out any invalid coaches
        const validCoaches = (rawCoachesData || []).filter(
          (coach: any): coach is Coach =>
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
          new Map(
            validCoaches.map((coach: Coach) => [coach.id, coach])
          ).values()
        );
        // Sort coaches alphabetically by name
        const sortedCoaches = uniqueCoaches.sort((a: Coach, b: Coach) =>
          a.name.localeCompare(b.name)
        );
        setCoaches(sortedCoaches);
        // Set players and teams to empty arrays for now (not needed for basic coach list)
        setPlayers([] as Player[]);
        setTeams([] as Team[]);
        if (sortedCoaches.length > 0 && sortedCoaches[0]) {
          setSelectedCoach(sortedCoaches[0]);
        }
      } catch (err) {
        // console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setCoaches([] as Coach[]);
        setPlayers([] as Player[]);
        setTeams([] as Team[]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Reset page when coach selection changes
  useEffect(() => {
    // setPage(1);
  }, [selectedCoachId]);
  if (loading) {
    return (
      <DashboardLayout
        left={
          <div className="space-y-4">
            {/* TODO: Port your left sidebar content here */}
          </div>
        }
        center={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading coaches...</p>
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

  return (
    <DashboardLayout
      left={
        <CoachListCard
          title="Coaches"
          coaches={coaches}
          selectedCoachId={selectedCoachId || undefined}
          onCoachSelect={coach => handleCoachSelect(coach.id)}
          showSearch={true}
          maxHeight="calc(100vh - 200px)"
        />
      }
      center={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Coach Management</h1>
          </div>

          {selectedCoach ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedCoach.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <p className="text-gray-900">{selectedCoach.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedCoach.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team
                    </label>
                    <p className="text-gray-900">{selectedCoach.team}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <p className="text-gray-900">{selectedCoach.role}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Team Players</h3>
                <div className="space-y-2">
                  {selectedCoachPlayers.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {player.name || player.displayName}
                        </p>
                        <p className="text-sm text-gray-600">{player.team}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {player.status}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedCoachPlayers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No players found for this coach
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Coach
              </h3>
              <p className="text-gray-500">
                Choose a coach from the left sidebar to view details and manage
                their team.
              </p>
            </div>
          )}
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Add Coach
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Export Data
              </button>
            </div>
          </div>

          {selectedCoach && (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Coach Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-medium">
                    {selectedCoachPlayers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">
                    {selectedCoach.experience} years
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
