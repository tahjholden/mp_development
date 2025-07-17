'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UniversalButton from '@/components/ui/UniversalButton';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function AddPlayerPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserRole();

  // Fetch teams when page loads
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/user/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch {
      // Handle error silently
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
        // Success! Navigate back to players page
        router.push('/players');
      } else {
        // Handle error
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add player'}`);
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
            <h1 className="text-2xl font-bold text-white">Add New Player</h1>
            <UniversalButton.Secondary onClick={() => router.back()}>
              Cancel
            </UniversalButton.Secondary>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="playerName"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Player Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                  required
                />
              </div>

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
                  htmlFor="team"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Team
                </label>
                <select
                  id="team"
                  value={team}
                  onChange={e => setTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                  required
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <UniversalButton.Primary type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Player'}
                </UniversalButton.Primary>
              </div>
            </form>
          </div>
        </div>
      }
    />
  );
}
