'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Eye, Edit, Trash2, Star, Tag } from 'lucide-react';
import ThreeColumnLayout from '@/components/basketball/ThreeColumnLayout';
import PlayerListCard from '@/components/basketball/PlayerListCard';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import UniversalModal from '@/components/ui/UniversalModal';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AddPlayerModal from '@/components/basketball/AddPlayerModal';
import ArchivePlanModal from '@/components/basketball/ArchivePlanModal';

// Types for observations
interface Observation {
  id: string;
  playerId: string;
  playerName: string;
  coachId: string;
  coachName: string;
  title: string;
  description: string;
  type: 'practice' | 'game' | 'skill_development' | 'physical' | 'mental' | 'other';
  category: string;
  rating: number;
  date: string;
  tags: string[];
  notes: string;
  private: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showDeletePlayerModal, setShowDeletePlayerModal] = useState(false);
  const [showArchivePlanModal, setShowArchivePlanModal] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loadingObservations, setLoadingObservations] = useState(true);
  const [errorObservations, setErrorObservations] = useState<string | null>(null);
  
  // Handler for adding a new player
  const handleAddPlayer = () => {
    setShowAddPlayerModal(true);
  };
  
  // Handler for selecting a player
  const handlePlayerSelect = (player: any) => {
    setSelectedPlayer(player);
  };
  
  // Handler for deleting a player
  const handleDeletePlayer = () => {
    setShowDeletePlayerModal(true);
  };
  
  // Handler for archiving a development plan
  const handleArchivePlan = () => {
    setShowArchivePlanModal(true);
  };

  // Handler for add player form submission
  const handleAddPlayerSubmit = (data: any) => {
    // In a real app, this would add the player to the database
    console.log('Adding player:', data);
    
    // Create a new player object
    const newPlayer = {
      id: `${players.length + 1}`,
      name: `${data.firstName} ${data.lastName}`,
      teamId: data.teamId,
      status: 'active' as const,
    };
    
    // For demo purposes, we'll just log it
    console.log('New player would be added:', newPlayer);
    
    // Close the modal
    setShowAddPlayerModal(false);
  };
  
  // Handler for delete player confirmation
  const handleDeletePlayerConfirm = () => {
    // In a real app, this would delete the player from the database
    console.log('Deleting player:', selectedPlayer);
    
    // For demo purposes, we'll just log it and clear the selection
    setSelectedPlayer(null);
    
    // Close the modal
    setShowDeletePlayerModal(false);
  };
  
  // Handler for archive plan confirmation
  const handleArchivePlanConfirm = () => {
    // In a real app, this would archive the development plan
    console.log('Archiving development plan for player:', selectedPlayer);
    
    // For demo purposes, we'll just log it
    console.log('Plan would be archived');
    
    // Close the modal
    setShowArchivePlanModal(false);
  };

  useEffect(() => {
    // Fetch teams
    fetch('/api/user/teams')
      .then(res => res.json())
      .then(data => {
        // Deduplicate teams by id
        const uniqueTeams = Array.from(
          new Map(data.map((team: any) => [team.id, team])).values()
        );
        uniqueTeams.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setTeams(uniqueTeams);
      });
    // Fetch players
    fetch('/api/dashboard/players')
      .then(res => res.json())
      .then(data => setPlayers(data));
    // Fetch observations
    setLoadingObservations(true);
    setErrorObservations(null);
    fetch('/api/observations')
      .then(res => res.json())
      .then(data => setObservations(data))
      .catch(err => setErrorObservations('Failed to fetch observations'))
      .finally(() => setLoadingObservations(false));
  }, []);

  // Helper to get rating stars
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-zinc-600'}`}
      />
    ));
  };

  // Helper to get type badge
  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      practice: 'text-blue-500 bg-blue-500/20',
      game: 'text-green-500 bg-green-500/20',
      skill_development: 'text-purple-500 bg-purple-500/20',
      physical: 'text-orange-500 bg-orange-500/20',
      mental: 'text-pink-500 bg-pink-500/20',
      other: 'text-gray-500 bg-gray-500/20',
    };
    return typeColors[type] || typeColors.other;
  };

  // Filter observations for the selected player
  const playerObservations = selectedPlayer
    ? observations.filter(obs => obs.playerId === selectedPlayer.id)
    : [];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Players</h1>
          
          {selectedPlayer && (
            <div className="flex gap-2">
              <UniversalButton.Secondary
                size="sm"
                onClick={() => {/* Edit player logic */}}
              >
                Edit Player
              </UniversalButton.Secondary>
              
              <UniversalButton.Danger
                size="sm"
                onClick={handleDeletePlayer}
              >
                Delete Player
              </UniversalButton.Danger>
            </div>
          )}
        </div>
        
        <ThreeColumnLayout
          leftColumnWidth="1fr"
          middleColumnWidth="1.5fr"
          rightColumnWidth="1fr"
          gapSize="lg"
          
          leftColumn={
            <PlayerListCard
              players={players}
              teams={teams}
              selectedPlayerId={selectedPlayer?.id}
              onPlayerSelect={handlePlayerSelect}
              onAddPlayer={handleAddPlayer}
              showSearch={true}
              showTeamFilter={true}
              emptyStateMessage="No players found. Add your first player to get started."
              maxHeight="calc(100vh - 12rem)"
            />
          }
          
          middleColumn={
            <>
              {/* Player Profile Section */}
              {selectedPlayer ? (
                <UniversalCard.Default
                  title="Player Profile"
                  className="mb-6"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-zinc-400">Name</p>
                        <p className="text-white">{selectedPlayer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Team</p>
                        <p className="text-white">
                          {teams.find(t => t.id === selectedPlayer.teamId)?.name || 'No Team'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400">Status</p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        selectedPlayer.status === 'active' 
                          ? 'bg-gold-500/20 text-gold-500' 
                          : 'bg-danger-500/20 text-danger-500'
                      }`}>
                        {selectedPlayer.status === 'active' ? 'Active' : 'Archived'}
                      </div>
                    </div>
                  </div>
                </UniversalCard.Default>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center">
                  <Shield className="text-zinc-700 w-20 h-20 mb-5" />
                  <h3 className="text-lg font-medium text-white mb-2">Select a Player to View Their Profile</h3>
                  <p className="text-sm text-zinc-400 max-w-md mb-6">Select a player from the list to view their profile details.</p>
                </div>
              )}
              
              {/* Development Plan Section */}
              {selectedPlayer ? (
                <UniversalCard.Default
                  title="Development Plan"
                  footer={
                    <div className="flex justify-end gap-2">
                      <UniversalButton.Secondary size="sm">
                        Edit Plan
                      </UniversalButton.Secondary>
                      <UniversalButton.Secondary 
                        size="sm"
                        onClick={handleArchivePlan}
                      >
                        Archive Plan
                      </UniversalButton.Secondary>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-zinc-400">Started</p>
                      <p className="text-white">June 24th, 2025</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400">Focus Areas</p>
                      <p className="text-white">Shooting, Ball Handling, Defense</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-zinc-400">Plan Details</p>
                      <p className="text-white">
                        This player is focusing on improving their shooting mechanics and ball handling skills.
                        Regular drills and practice sessions are scheduled to enhance these areas.
                      </p>
                    </div>
                  </div>
                </UniversalCard.Default>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center">
                  <Shield className="text-zinc-700 w-20 h-20 mb-5" />
                  <h3 className="text-lg font-medium text-white mb-2">Select a Player to View Their Profile</h3>
                  <p className="text-sm text-zinc-400 max-w-md mb-6">Select a player to view their development plan.</p>
                </div>
              )}
            </>
          }
          
          rightColumn={
            <>
              {/* Observations Section */}
              {selectedPlayer ? (
                <UniversalCard.Default
                  title="Observations"
                  footer={
                    <UniversalButton.Primary size="sm" className="w-full">
                      Add Observation
                    </UniversalButton.Primary>
                  }
                >
                  {loadingObservations ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-zinc-400 text-sm mb-4">Loading observations...</p>
                    </div>
                  ) : errorObservations ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-red-400 text-sm mb-4">{errorObservations}</p>
                    </div>
                  ) : playerObservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Shield className="text-zinc-700 w-16 h-16 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No Observations Yet</h3>
                      <p className="text-sm text-zinc-400 max-w-md mb-6">This player doesn't have any observations yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {playerObservations.map((observation) => (
                        <UniversalCard.Default
                          key={observation.id}
                          title={observation.title}
                          subtitle={`Coach: ${observation.coachName}`}
                          className="transition-all hover:bg-zinc-800/50"
                        >
                          <div className="space-y-2">
                            <p className="text-zinc-400 text-sm">{observation.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {observation.private && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-500 bg-red-500/20">
                                    Private
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {getRatingStars(observation.rating)}
                              </div>
                            </div>
                            {observation.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {observation.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-zinc-400 bg-zinc-800"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="text-xs text-zinc-500">
                              {new Date(observation.date).toLocaleDateString()}
                            </span>
                          </div>
                        </UniversalCard.Default>
                      ))}
                    </div>
                  )}
                </UniversalCard.Default>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center">
                  <Shield className="text-zinc-700 w-20 h-20 mb-5" />
                  <h3 className="text-lg font-medium text-white mb-2">Select a Player to View Their Profile</h3>
                  <p className="text-sm text-zinc-400 max-w-md mb-6">Select a player to view their observations.</p>
                </div>
              )}
              
              {/* PDP Archive Section */}
              <UniversalCard.Default
                title="Archived PDPs"
                className="mt-6"
              >
                <div className="py-4">
                  <p className="text-zinc-400 text-center text-sm">
                    No archived plans found.
                  </p>
                </div>
              </UniversalCard.Default>
            </>
          }
        />
        
        {/* Add Player Modal */}
        <AddPlayerModal
          isOpen={showAddPlayerModal}
          onClose={() => setShowAddPlayerModal(false)}
          onSubmit={handleAddPlayerSubmit}
          teams={teams}
        />
        
        {/* Delete Player Confirmation Modal */}
        <UniversalModal.Confirm
          open={showDeletePlayerModal}
          onOpenChange={setShowDeletePlayerModal}
          onConfirm={handleDeletePlayerConfirm}
          onCancel={() => setShowDeletePlayerModal(false)}
          title="Delete Player"
          description={`Are you sure you want to delete ${selectedPlayer?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
        
        {/* Archive Plan Confirmation Modal */}
        <ArchivePlanModal
          isOpen={showArchivePlanModal}
          onClose={() => setShowArchivePlanModal(false)}
          onConfirm={handleArchivePlanConfirm}
        />
      </div>
    </DashboardLayout>
  );
}
