'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UniversalButton from '@/components/ui/UniversalButton';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function AddParentPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserRole();

  // Fetch players when page loads
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/dashboard/players?limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.players) {
          setPlayers(
            data.players.map((player: { id: string; name?: string }) => ({
              id: player.id,
              name: player.name || 'Unknown Player',
            }))
          );
        }
      }
    } catch {
      // Handle error silently
    }
  };

  const handlePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/parents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          playerIds: selectedPlayers,
          organizationId: user?.organizationId,
        }),
      });

      if (response.ok) {
        // Success! Navigate back to parents page
        router.push('/parents');
      } else {
        // Handle error
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add parent'}`);
      }
    } catch {
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      center={
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Add New Parent</h1>
            <UniversalButton.Secondary onClick={() => router.back()}>
              Cancel
            </UniversalButton.Secondary>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Associated Players
                </label>
                <div className="max-h-48 overflow-y-auto border border-zinc-700 rounded-md p-2 bg-zinc-800">
                  {players.length > 0 ? (
                    players.map(player => (
                      <div key={player.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          id={`player-${player.id}`}
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => handlePlayerSelection(player.id)}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[#d8cc97] focus:ring-[#d8cc97]"
                        />
                        <label
                          htmlFor={`player-${player.id}`}
                          className="ml-2 text-sm text-zinc-300"
                        >
                          {player.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 py-2 text-center">
                      No players available
                    </p>
                  )}
                </div>
                {selectedPlayers.length > 0 && (
                  <p className="text-xs text-zinc-400">
                    {selectedPlayers.length} player
                    {selectedPlayers.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <UniversalButton.Primary type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Parent'}
                </UniversalButton.Primary>
              </div>
            </form>
          </div>
        </div>
      }
    />
  );
}
