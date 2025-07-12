'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThreeColumnLayout from '@/components/basketball/ThreeColumnLayout';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db/drizzle';
import { 
  mpCoreGroup, 
  mpCorePerson, 
  mpCorePersonGroup, 
  Group, 
  Person 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export default function TeamsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  
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
        let teamsData: any[] = [];
        
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
        
        setTeams(teamsData);
        
        // Select the first team by default if available
        if (teamsData.length > 0) {
          setSelectedTeam(teamsData[0]);
          fetchTeamPlayers(teamsData[0].id);
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
  const handleTeamSelect = (team: any) => {
    setSelectedTeam(team);
    fetchTeamPlayers(team.id);
  };
  
  // Handler for adding a new team
  const handleAddTeam = () => {
    setShowAddTeamModal(true);
  };

  // Deduplicate teams by id and sort alphabetically by name before rendering
  const uniqueTeams = Array.from(
    new Map(teams.map((team: any) => [team.id, team])).values()
  ).sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Check if there are any teams
  const hasTeams = uniqueTeams.length > 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-gold-500 animate-spin mb-4" />
            <p className="text-zinc-400">Loading teams...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Teams</h1>
          
          <UniversalButton.Primary
            onClick={handleAddTeam}
            leftIcon={<Users size={16} />}
          >
            Add Team
          </UniversalButton.Primary>
        </div>
        
        <ThreeColumnLayout
          leftColumnWidth="1fr"
          middleColumnWidth="1.5fr"
          rightColumnWidth="1fr"
          gapSize="lg"
          
          leftColumn={
            hasTeams ? (
              <UniversalCard.Default title="Teams">
                <div className="space-y-2 py-2">
                  {uniqueTeams.map((team) => (
                    <UniversalCard.PlayerStatus
                      key={team.id}
                      status={team.id === selectedTeam?.id ? 'active' : 'inactive'}
                      selected={team.id === selectedTeam?.id}
                      hover="border"
                      className="cursor-pointer transition-all"
                      onClick={() => handleTeamSelect(team)}
                      size="sm"
                    >
                      <div className="py-1.5 px-2">
                        <p className="font-medium text-sm">
                          {team.name}
                        </p>
                      </div>
                    </UniversalCard.PlayerStatus>
                  ))}
                </div>
              </UniversalCard.Default>
            ) : (
              <UniversalCard.NoDataState
                icon={<Shield className="text-zinc-700" />}
                title="No Data Available"
                message="There are no teams in your organization yet. Add your first team to get started."
                action={
                  <UniversalButton.Primary 
                    onClick={handleAddTeam}
                    className="mt-4"
                  >
                    Add Team
                  </UniversalButton.Primary>
                }
              />
            )
          }
          
          middleColumn={
            <>
              {/* Team Profile Section */}
              {selectedTeam ? (
                <UniversalCard.Default
                  title="Team Profile"
                  className="mb-6"
                >
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
                </UniversalCard.Default>
              ) : (
                <UniversalCard.SelectTeamState
                  icon={<Shield className="text-zinc-700" />}
                  message="Select a team from the list to view their profile details."
                />
              )}
              
              {/* Roster Section */}
              {selectedTeam ? (
                <UniversalCard.Default 
                  title="Roster"
                  footer={
                    <UniversalButton.Primary size="sm">
                      Add Player to Team
                    </UniversalButton.Primary>
                  }
                >
                  {teamPlayers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {teamPlayers.map((player) => (
                        <UniversalCard.Default
                          key={player.id}
                          className="border border-gold-500/50 hover:border-gold-500 transition-colors"
                          size="sm"
                          onClick={() => router.push(`/players?id=${player.id}`)}
                        >
                          <div className="py-1 px-2 text-center">
                            <p className="text-sm">{player.displayName}</p>
                          </div>
                        </UniversalCard.Default>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-zinc-400 text-sm mb-4">No players in this team yet</p>
                    </div>
                  )}
                </UniversalCard.Default>
              ) : (
                <UniversalCard.SelectTeamState
                  icon={<Shield className="text-zinc-700" />}
                  message="Select a team to view their roster."
                />
              )}
            </>
          }
          
          rightColumn={
            <UniversalCard.Default title="Planned Features">
              <div className="py-2">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-gold-500 mr-2">•</span>
                    <span className="text-sm text-gold-500">Practice & game schedule</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold-500 mr-2">•</span>
                    <span className="text-sm text-gold-500">Team attendance & participation heatmap</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold-500 mr-2">•</span>
                    <span className="text-sm text-gold-500">Announcements & team messaging</span>
                  </li>
                </ul>
                
                <p className="text-xs text-zinc-400 italic mt-6">
                  These features are on our roadmap and will be launching soon for all teams!
                </p>
              </div>
            </UniversalCard.Default>
          }
        />
        
        {/* Add Team Modal would be implemented separately */}
      </div>
    </DashboardLayout>
  );
}
