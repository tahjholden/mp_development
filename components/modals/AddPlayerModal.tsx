'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import UniversalButton from '@/components/ui/UniversalButton';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function AddPlayerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserRole();

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-add-player-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-add-player-modal', handleOpenModal);
    };
  }, []);

  // Fetch teams when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/user/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          email,
          teamId: team,
          organizationId: user?.organizationId,
        }),
      });

      if (response.ok) {
        // Success! Close modal and reset form
        setIsOpen(false);
        setPlayerName('');
        setEmail('');
        setTeam('');
        // Optionally trigger a refresh of player data
        window.dispatchEvent(new CustomEvent('player-added'));
      } else {
        // Handle error
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add player'}`);
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Player">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="playerName" className="block text-sm font-medium text-zinc-300">
            Player Name
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="team" className="block text-sm font-medium text-zinc-300">
            Team
          </label>
          <select
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
            required
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <UniversalButton.Secondary
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </UniversalButton.Secondary>
          <UniversalButton.Primary type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Player'}
          </UniversalButton.Primary>
        </div>
      </form>
    </Modal>
  );
}