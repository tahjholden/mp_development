'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, User, Loader2, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { cn } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  coachName?: string;
  createdAt: string;
}

interface Player {
  id: string;
  displayName: string;
  teamId: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  
  // Fetch current user and their teams
  useEffect(() => {
    const fetchUserAndTeams = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current user
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch user');
        const userData = await response.json();
        setCurrentUser(userData);
        
        // Fetch teams - either all teams for superadmin or only teams user is part of
        let teamsData: Team[] = [];
        
        if (userData.isSuperadmin) {
          // Superadmin sees all teams
          const teamsResponse = await fetch('/api/teams');
          if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
          teamsData = await teamsResponse.json();
        } else {
          // Regular user only sees their teams
          const userTeamsResponse = await fetch(`/api/user/teams`);
          if (!userTeamsResponse.ok) throw new Error('Failed to fetch user teams');
          teamsData = await userTeamsResponse.json();
        }
        
        // Deduplicate teams by id and sort alphabetically
        const uniqueTeams = Array.from(
          new Map(teamsData.map((team: any) => [team.id, team])).values()
        ) as Team[];
        uniqueTeams.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setTeams(uniqueTeams);
        
        // Select the first team by default if available
        if (uniqueTeams.length > 0) {
          setSelectedTeam(uniqueTeams[0]);
          fetchTeamPlayers(uniqueTeams[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndTeams();
  }, []);
  
  // Fetch players for a selected team
  const fetchTeamPlayers = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players`);
      if (!response.ok) throw new Error('Failed to fetch team players');
      const playersData = await response.json();
      setTeamPlayers(playersData);
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
    setShowAddTeamModal(true);
  };

  // Filter teams based on search
  const filteredTeams = teams.filter((team) => {
    return team.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Check if there are any teams
  const hasTeams = filteredTeams.length > 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
        {/* Header - exact replica with coach info */}
        <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
          <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
            MP Player Development
          </span>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-white leading-tight">Coach</span>
            <span className="text-xs text-[#d8cc97] leading-tight">coach@example.com</span>
            <span className="text-xs text-white leading-tight">Coach</span>
          </div>
        </header>
        
        {/* Sidebar */}
        <Sidebar 
          user={{
            name: "Coach",
            email: "coach@example.com", 
            role: "Coach"
          }}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
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
    <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
      {/* Header - exact replica with coach info */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
        <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">Coach</span>
          <span className="text-xs text-[#d8cc97] leading-tight">coach@example.com</span>
          <span className="text-xs text-white leading-tight">Coach</span>
        </div>
      </header>
      
      {/* Sidebar */}
      <Sidebar 
        user={{
          name: "Coach",
          email: "coach@example.com", 
          role: "Coach"
        }}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
        {/* LEFT PANE: Team List */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#d8cc97] mt-0">Teams</h2>
            <UniversalButton.Primary
              size="sm"
              onClick={handleAddTeam}
              leftIcon={<Users size={16} />}
            >
              Add Team
            </UniversalButton.Primary>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>

          {/* Team List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {!hasTeams ? (
              <div className="text-center py-8">
                <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No teams found</p>
                <p className="text-xs text-zinc-500 mt-1">Add your first team to get started</p>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedTeam?.id === team.id
                      ? 'bg-[#d8cc97]/20 border border-[#d8cc97]'
                      : 'bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{team.name}</p>
                      <p className="text-sm text-zinc-400">
                        {team.coachName || currentUser?.displayName || 'Not assigned'}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MIDDLE PANE: Team Profile */}
        <div className="flex-1 p-6 bg-black">
          {selectedTeam ? (
            <div className="space-y-6">
              {/* Team Profile Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#d8cc97]">Team Profile</h3>
                  <div className="flex gap-2">
                    <UniversalButton.Secondary size="sm">
                      Edit Team
                    </UniversalButton.Secondary>
                    <UniversalButton.Danger size="sm">
                      Delete Team
                    </UniversalButton.Danger>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Name</p>
                      <p className="text-white">{selectedTeam.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Coach</p>
                      <p className="text-white">{selectedTeam.coachName || currentUser?.displayName || 'Not assigned'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Players</p>
                      <p className="text-white">{teamPlayers.length} players</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Created</p>
                      <p className="text-white">{new Date(selectedTeam.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Roster Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#d8cc97]">Roster</h3>
                  <UniversalButton.Primary size="sm">
                    Add Player to Team
                  </UniversalButton.Primary>
                </div>
                
                {teamPlayers.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {teamPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="bg-zinc-800/50 border border-gold-500/50 hover:border-gold-500 transition-colors rounded-lg p-3 cursor-pointer"
                        onClick={() => router.push(`/players?id=${player.id}`)}
                      >
                        <div className="text-center">
                          <p className="text-sm text-white">{player.displayName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">No players in this team yet</p>
                    <p className="text-sm text-zinc-500">Add players to build your roster</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center h-full">
              <Shield className="text-zinc-700 w-20 h-20 mb-5" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Team to View Details</h3>
              <p className="text-sm text-zinc-400 max-w-md mb-6 text-center">Select a team from the list to view their profile and roster.</p>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Team Stats */}
        <div className="w-1/3 border-l border-zinc-800 p-6 bg-black flex flex-col min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">Team Statistics</h2>
          
          {selectedTeam ? (
            <div className="space-y-6">
              {/* Basic Stats */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Total Players</span>
                    <span className="text-white">{teamPlayers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Active Players</span>
                    <span className="text-white">{teamPlayers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Team Age</span>
                    <span className="text-white">New</span>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Recent Activity</h4>
                <div className="text-center py-4">
                  <Calendar className="text-zinc-700 w-8 h-8 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">No recent activity</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Select a team to view statistics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
