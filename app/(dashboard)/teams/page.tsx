'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Loader2, Search } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import UniversalButton from '@/components/ui/UniversalButton';
import { UserResponseSchema } from '@/lib/utils';
import { z } from 'zod';

// Zod schemas for validation
const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  coachName: z.string(),
});
const TeamsArraySchema = z.array(TeamSchema);

const PlayerSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  teamId: z.string(),
  personType: z.string().optional(),
  position: z.string().optional(),
});
const PlayersArraySchema = z.array(PlayerSchema);

interface Team {
  id: string;
  name: string;
  coachName: string;
}

interface Player {
  id: string;
  displayName: string;
  teamId: string;
  personType?: string;
  position?: string;
}

export default function TeamsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');

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
        if (!validatedUser.success) {
          console.error('Invalid user data:', validatedUser.error);
          throw new Error('Invalid user data received');
        }

        if (!validatedUser.data) {
          console.error('No user data available');
          throw new Error('No user data available');
        }

        setCurrentUser(validatedUser.data);

        // Fetch teams - all users see their teams
        const userTeamsResponse = await fetch(`/api/user/teams`);
        if (!userTeamsResponse.ok)
          throw new Error('Failed to fetch user teams');
        const rawUserTeamsData = await userTeamsResponse.json();

        // Validate user teams data
        const validatedUserTeams =
          TeamsArraySchema.safeParse(rawUserTeamsData);
        if (!validatedUserTeams.success) {
          console.error('Invalid user teams data:', validatedUserTeams.error);
          throw new Error('Invalid user teams data received');
        }
        const teamsData = validatedUserTeams.data;

        // Filter out any invalid teams and deduplicate by id
        const validTeams = teamsData.filter(
          (team): team is Team =>
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
          new Map(validTeams.map(team => [team.id, team])).values()
        );
        uniqueTeams.sort((a, b) => a.name.localeCompare(b.name));
        setTeams(uniqueTeams);

        // Select the first team by default if available
        if (uniqueTeams.length > 0 && uniqueTeams[0]) {
          setSelectedTeam(uniqueTeams[0]);
          fetchTeamPlayers(uniqueTeams[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTeams([]);
        setCurrentUser(null);
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
      const validatedPlayers = PlayersArraySchema.safeParse(rawPlayersData);
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
          typeof player.displayName === 'string' &&
          typeof player.teamId === 'string' &&
          player.id.trim() !== '' &&
          player.displayName.trim() !== '' &&
          player.teamId.trim() !== ''
      );

      // Deduplicate players by id
      const uniquePlayers = Array.from(
        new Map(validPlayers.map(player => [player.id, player])).values()
      );
      setTeamPlayers(uniquePlayers);
    } catch (error) {
      console.error('Error fetching team players:', error);
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
    console.log('Add Team clicked');
  };

  // Filter teams based on search
  const filteredTeams = teams.filter(team => {
    return team.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Check if there are any teams
  const hasTeams = filteredTeams.length > 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen h-full bg-black text-white">
        <Sidebar
          user={{ name: 'Coach', email: 'coach@example.com', role: 'Coach' }}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <header
            className="w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between"
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
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-gold-500 animate-spin mb-4" />
              <p className="text-zinc-400">Loading teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen h-full bg-black text-white"
      style={{ background: 'black' }}
    >
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
            {currentUser?.displayName || 'Coach'}
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            {currentUser?.email || 'coach@example.com'}
          </span>
          <span className="text-xs text-white leading-tight">
            {currentUser?.role || 'Coach'}
          </span>
        </div>
      </header>
      <Sidebar
        user={
          currentUser
            ? {
                name: currentUser.displayName || currentUser.name || 'Coach',
                email: currentUser.email || 'coach@example.com',
                role: currentUser.role || 'Coach',
              }
            : {
                name: 'Coach',
                email: 'coach@example.com',
                role: 'Coach',
              }
        }
      />
      <div
        className="flex-1 flex ml-64 pt-16 bg-black min-h-screen"
        style={{ background: 'black', minHeight: '100vh' }}
      >
        {/* LEFT COLUMN: Team Selector */}
        <div
          className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Teams</h2>
          <div className="flex justify-between items-center mb-6">
            <UniversalButton.Primary
              size="sm"
              onClick={handleAddTeam}
              leftIcon={<Users size={16} />}
            >
              Add Team
            </UniversalButton.Primary>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {!hasTeams ? (
              <div className="text-center py-8">
                <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No teams found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Add your first team to get started
                </p>
              </div>
            ) : (
              filteredTeams.map(team => {
                
                return (
                  <div
                    key={team.id}
                    onClick={() => handleTeamSelect(team)}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between border ${selectedTeam?.id === team.id ? 'bg-[#d8cc97]/20 border-[#d8cc97]' : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'}`}
                  >
                    <div>
                      <p className="font-medium text-white">{team.name}</p>
                      <p className="text-sm text-zinc-400">
                        {team.coachName ||
                          currentUser?.displayName ||
                          'Not assigned'}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* CENTER COLUMN: Team Profile + Roster */}
        <div
          className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedTeam ? selectedTeam.name : 'Team Profile'}
          </h2>
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 space-y-2 shadow-md mb-8">
            {selectedTeam ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Name</p>
                  <p className="text-white">{selectedTeam.name}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Coach</p>
                  <p className="text-white">
                    {selectedTeam.coachName ||
                      currentUser?.displayName ||
                      'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Players</p>
                  <p className="text-white">{teamPlayers.length} players</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <Shield className="text-zinc-700 w-20 h-20 mb-5" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Select a Team to View Details
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">
                  Select a team from the list to view their profile and roster.
                </p>
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Roster</h2>
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <UniversalButton.Primary size="sm">
                Add Player to Team
              </UniversalButton.Primary>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {teamPlayers
                .map((p: any) => ({
                  id: p.id,
                  name: p.displayName || p.name || 'Unknown Player',
                  status: p.status || 'active',
                }))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(player => (
                  <button
                    key={player.id}
                    className={`w-full text-sm font-medium py-2 px-3 border rounded-md bg-neutral-800 hover:bg-neutral-700 transition-all whitespace-nowrap overflow-hidden text-ellipsis
                      ${player.status === 'active' ? 'border-yellow-500 text-yellow-200' : player.status === 'archived' ? 'border-red-500 text-red-400' : 'border-neutral-700 text-white'}`}
                    title={player.name}
                  >
                    {player.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
        {/* RIGHT COLUMN: (Optional future content) */}
        <div
          className="w-1/4 p-6 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          {/* You can add insights, activity, or leave empty for now */}
        </div>
      </div>
    </div>
  );
}
