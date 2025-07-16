'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import CoachListCard from '@/components/basketball/CoachListCard';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { Users, Plus, Download } from 'lucide-react';
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
// Types for teams
interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}
// Main component
export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedCoachPlayers, setSelectedCoachPlayers] = useState<Player[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  // Add state for development plans to check if players have plans
  const [allDevelopmentPlans, setAllDevelopmentPlans] = useState<any[]>([]);
  // Add state for teams
  const [teams, setTeams] = useState<Team[]>([]);

  // Function to check if a player has a development plan
  const hasDevelopmentPlan = (playerId: string) =>
    allDevelopmentPlans.some(plan => plan.playerId === playerId);

  // Filter coaches by selected team
  // const filteredCoaches = selectedCoachId
  //   ? coaches.filter(coach => coach.id === selectedCoachId)
  //   : coaches;
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
      ) as Player[];
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
        ) as Coach[];
        // Sort coaches alphabetically by name
        const sortedCoaches = uniqueCoaches.sort((a: Coach, b: Coach) =>
          a.name.localeCompare(b.name)
        );
        setCoaches(sortedCoaches);
        if (sortedCoaches.length > 0 && sortedCoaches[0]) {
          setSelectedCoach(sortedCoaches[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Fetch development plans for color logic
  useEffect(() => {
    const fetchDevelopmentPlans = async () => {
      try {
        const response = await fetch('/api/development-plans');
        if (response.ok) {
          const plans = await response.json();
          setAllDevelopmentPlans(plans || []);
        }
      } catch (error) {
        console.error('Error fetching development plans:', error);
        setAllDevelopmentPlans([]);
      }
    };
    fetchDevelopmentPlans();
  }, []);
  // Fetch teams for dropdown
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (response.ok) {
          const teamsData = await response.json();
          setTeams(teamsData || []);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([]);
      }
    };
    fetchTeams();
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
          showTeamFilter={true}
          maxHeight="calc(100vh - 200px)"
          allTeams={teams}
        />
      }
      center={
        <div className="space-y-6">
          {/* Coach Profile Header - Always visible */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#d8cc97]">Coach Profile</h1>
          </div>

          {selectedCoach ? (
            <div className="space-y-6">
              <UniversalCard.Default title="Coach Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Name
                    </label>
                    <p className="text-white">{selectedCoach.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Email
                    </label>
                    <p className="text-white">{selectedCoach.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Team
                    </label>
                    <p className="text-white">{selectedCoach.team}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Role
                    </label>
                    <p className="text-white">{selectedCoach.role}</p>
                  </div>
                </div>
              </UniversalCard.Default>

              {/* Roster Header - Always visible */}
              <h2 className="text-xl font-bold text-[#d8cc97] mt-6 mb-4">
                Roster
              </h2>

              <UniversalCard.Default>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCoachPlayers.map(player => (
                    <div
                      key={player.id}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        hasDevelopmentPlan(player.id)
                          ? 'border-[#d8cc97] bg-zinc-800/50'
                          : 'border-red-500 bg-zinc-800/50'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-white">
                          {player.name || player.displayName}
                        </p>
                        <p className="text-sm text-zinc-400">{player.team}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* No empty state card for empty lists - just show nothing */}
              </UniversalCard.Default>
            </div>
          ) : (
            /* Empty state card that maintains the same layout position and sizing */
            <UniversalCard.EmptyState
              title="Select a Coach"
              message="Choose a coach from the left sidebar to view details and manage their team."
              icon={<Users className="h-16 w-16 text-zinc-600" />}
              className="min-h-[400px] flex items-center justify-center"
            />
          )}
        </div>
      }
      right={
        <div className="space-y-4">
          <UniversalCard.Default
            title="Quick Actions"
            subtitle="Coach management tools"
          >
            <div className="space-y-2">
              <UniversalButton.Secondary
                onClick={() => {
                  /* Add coach logic */
                }}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Coach
              </UniversalButton.Secondary>
              <UniversalButton.Secondary
                onClick={() => {
                  /* Export data logic */
                }}
                size="sm"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </UniversalButton.Secondary>
            </div>
          </UniversalCard.Default>
        </div>
      }
    />
  );
}
