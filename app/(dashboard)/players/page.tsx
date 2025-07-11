'use client';

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import ThreeColumnLayout from '@/components/basketball/ThreeColumnLayout';
import PlayerListCard from '@/components/basketball/PlayerListCard';
import UniversalCard from '@/components/ui/UniversalCard';
import { UniversalButton } from '@/components/ui/UniversalButton';
import UniversalModal from '@/components/ui/UniversalModal';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AddPlayerModal from '@/components/basketball/AddPlayerModal';
import ArchivePlanModal from '@/components/basketball/ArchivePlanModal';

// Mock data for demonstration
const mockPlayers = [
  { id: '1', name: 'Andrew Hemschoot', teamId: '1', status: 'active' },
  { id: '2', name: 'Ben Swersky', teamId: '1', status: 'active' },
  { id: '3', name: 'Brody Miller', teamId: '1', status: 'active' },
  { id: '4', name: 'Carrie Jones', teamId: '2', status: 'active' },
  { id: '5', name: 'Cole Hamilton', teamId: '2', status: 'active' },
  { id: '6', name: 'Cole Holden', teamId: '1', status: 'active' },
  { id: '7', name: 'Dillon Rice', teamId: '1', status: 'active' },
  { id: '8', name: 'HOW HOW', teamId: '2', status: 'active' },
  { id: '9', name: 'Jimmy Jim', teamId: '2', status: 'archived' },
  { id: '10', name: 'Jimmy Red', teamId: '3', status: 'active' },
  { id: '11', name: 'Joe Jones', teamId: '3', status: 'archived' },
  { id: '12', name: 'John Doe', teamId: '3', status: 'active' },
  { id: '13', name: 'JP Fernandez', teamId: '1', status: 'archived' },
  { id: '14', name: 'LJ Spitale', teamId: '2', status: 'active' },
  { id: '15', name: 'Michael Jordan', teamId: '3', status: 'archived' },
  { id: '16', name: 'Sam Marlow', teamId: '1', status: 'archived' },
];

const mockTeams = [
  { id: '1', name: 'MPBC 2033' },
  { id: '2', name: 'Team Test' },
  { id: '3', name: 'AAA FFF' },
];

export default function PlayersPage() {
  // State for selected player
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  
  // State for modal visibility
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showDeletePlayerModal, setShowDeletePlayerModal] = useState(false);
  const [showArchivePlanModal, setShowArchivePlanModal] = useState(false);
  
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
      id: `${mockPlayers.length + 1}`,
      name: `${data.firstName} ${data.lastName}`,
      teamId: data.teamId,
      status: 'active',
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
              players={mockPlayers}
              teams={mockTeams}
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
                          {mockTeams.find(t => t.id === selectedPlayer.teamId)?.name || 'No Team'}
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
                <UniversalCard.SelectPlayerState
                  icon={<Shield className="text-zinc-700" />}
                  message="Select a player from the list to view their profile details."
                />
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
                <UniversalCard.SelectPlayerState
                  icon={<Shield className="text-zinc-700" />}
                  message="Select a player to view their development plan."
                />
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
                  {/* If there are no observations */}
                  <UniversalCard.NoObservationsState
                    icon={<Shield className="text-zinc-700" />}
                  />
                </UniversalCard.Default>
              ) : (
                <UniversalCard.SelectPlayerState
                  icon={<Shield className="text-zinc-700" />}
                  message="Select a player to view their observations."
                />
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
          teams={mockTeams}
        />
        
        {/* Delete Player Confirmation Modal */}
        <UniversalModal.Confirmation
          isOpen={showDeletePlayerModal}
          onClose={() => setShowDeletePlayerModal(false)}
          onConfirm={handleDeletePlayerConfirm}
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
