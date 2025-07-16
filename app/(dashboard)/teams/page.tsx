'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Loader2, Users } from 'lucide-react';
import UniversalButton from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';
import TeamListCard from '@/components/basketball/TeamListCard';
import { z } from 'zod';

// Define schemas for teams and players
const TeamsResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    coachName: z.string(),
  })
);

const PlayersResponseSchema = z.array(
  z.object({
    id: z.string(),
    displayName: z.string(),
    teamId: z.string(),
    personType: z.string().optional(),
    position: z.string().optional(),
  })
);

const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
});

interface Team {
  id: string;
  name: string;
  coachName: string;
  [key: string]: unknown; // For additional team properties
}

interface Player {
  id: string;
  displayName: string;
  teamId: string;
  personType?: string;
  position?: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user and their teams
  useEffect(() => {
    const fetchUserAndTeams = async () => {
      try {
        setIsLoading(true);
        // Fetch current user with validation
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch user');
        const userData = await response.json();
        // Validate user data
        const validatedUser = UserResponseSchema.safeParse(userData);

        if (!validatedUser.data) {
          throw new Error('No user data available');
        }
        // Fetch teams - all users see their teams
        const userTeamsResponse = await fetch(`/api/user/teams`);
        if (!userTeamsResponse.ok)
          throw new Error('Failed to fetch user teams');
        const rawUserTeamsData = await userTeamsResponse.json();
        // Validate user teams data
        const validatedUserTeams =
          TeamsResponseSchema.safeParse(rawUserTeamsData);

        const teamsData = validatedUserTeams.data || [];
        // Filter out any invalid teams and deduplicate by id
        const validTeams = teamsData.filter(
          (team: any): team is Team =>
            team &&
            typeof team === 'object' &&
            typeof team.id === 'string' &&
            typeof team.name === 'string' &&
            typeof team.coachName === 'string' &&
            team.id.trim() !== '' &&
            team.name.trim() !== '' &&
            team.coachName.trim() !== ''
        );
        const uniqueTeams = Array.from(
          new Map(validTeams.map((team: Team) => [team.id, team])).values()
        );
        uniqueTeams.sort((a: Team, b: Team) => a.name.localeCompare(b.name));
        setTeams(uniqueTeams);
        // Select the first team by default if available
        if (uniqueTeams.length > 0 && uniqueTeams[0]) {
          setSelectedTeam(uniqueTeams[0]);
          fetchTeamPlayers(uniqueTeams[0].id);
        }
      } catch {
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndTeams();
  }, []);

  // Fetch team players with validation
  const fetchTeamPlayers = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players`);
      if (!response.ok) throw new Error('Failed to fetch team players');
      const rawPlayersData = await response.json();
      // Validate players data
      const validatedPlayers = PlayersResponseSchema.safeParse(rawPlayersData);

      // Filter out any invalid players
      const validPlayers = (validatedPlayers.data || []).filter(
        (player: any): player is Player =>
          player &&
          typeof player === 'object' &&
          typeof player.id === 'string' &&
          typeof player.displayName === 'string' &&
          typeof player.teamId === 'string' &&
          player.id.trim() !== '' &&
          player.displayName.trim() !== '' &&
          player.teamId.trim() !== ''
      );
      // Deduplicate players by id
      const uniquePlayers = Array.from(
        new Map(
          validPlayers.map((player: Player) => [player.id, player])
        ).values()
      );
      setTeamPlayers(uniquePlayers);
    } catch {
      setTeamPlayers([]);
    }
  };

  // Handler for selecting a team
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    fetchTeamPlayers(team.id);
  };

  // Handler for adding a new team
  const handleAddTeam = () => {
    // This functionality is not yet implemented, so this handler is kept for now
    // but the modal is removed.
  };

  if (isLoading) {
    return (
      <DashboardLayout
        left={
          <div className="space-y-4">
            {/* TODO: Port your left sidebar content here */}
          </div>
        }
        center={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
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
        <TeamListCard
          title="Teams"
          teams={teams}
          selectedTeamId={selectedTeam?.id || undefined}
          onTeamSelect={handleTeamSelect}
          onAddTeam={handleAddTeam}
          showSearch={true}
          maxHeight="calc(100vh - 200px)"
        />
      }
      center={
        <div className="space-y-6">
          {/* Team Management Header - Always visible */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#d8cc97]">
              Team Management
            </h1>
          </div>

          {selectedTeam ? (
            <div className="space-y-6">
              <UniversalCard.Default
                title={selectedTeam.name}
                subtitle="Team Information"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Team Name
                    </label>
                    <p className="text-white">{selectedTeam.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Coach
                    </label>
                    <p className="text-white">{selectedTeam.coachName}</p>
                  </div>
                </div>
              </UniversalCard.Default>

              <UniversalCard.Default
                title="Team Players"
                subtitle={`${teamPlayers.length} players`}
              >
                <div className="space-y-2">
                  {teamPlayers.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg bg-zinc-800/50"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {player.displayName}
                        </p>
                        {player.position && (
                          <p className="text-sm text-zinc-400">
                            Position: {player.position}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {player.personType || 'Player'}
                      </div>
                    </div>
                  ))}
                </div>
                {/* No empty state card for empty lists - just show nothing */}
              </UniversalCard.Default>
            </div>
          ) : (
            /* Empty state card that maintains the same layout position and sizing */
            <UniversalCard.SelectTeamState
              message="Choose a team from the left sidebar to view details and manage players."
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
            subtitle="Team management tools"
          >
            <div className="space-y-2">
              <UniversalButton.Secondary
                onClick={handleAddTeam}
                size="sm"
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Add New Team
              </UniversalButton.Secondary>
            </div>
          </UniversalCard.Default>

          {selectedTeam && (
            <UniversalCard.Default
              title="Team Stats"
              subtitle="Current team information"
            >
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Players:</span>
                  <span className="font-medium text-white">
                    {teamPlayers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Team ID:</span>
                  <span className="font-mono text-xs text-white">
                    {selectedTeam.id}
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
