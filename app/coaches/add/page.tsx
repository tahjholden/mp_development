'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UniversalButton from '@/components/ui/UniversalButton';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function AddCoachPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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

  // If superadmin is checked, admin should also be checked
  useEffect(() => {
    if (isSuperAdmin) {
      setIsAdmin(true);
    }
  }, [isSuperAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          teamId: team,
          organizationId: user?.organizationId,
          isAdmin,
          isSuperAdmin,
          personType: isSuperAdmin ? 'superadmin' : isAdmin ? 'admin' : 'coach',
        }),
      });

      if (response.ok) {
        // Success! Navigate back to coaches page
        router.push('/coaches');
      } else {
        // Handle error
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add coach'}`);
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
            <h1 className="text-2xl font-bold text-white">Add New Coach</h1>
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

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Permissions
                </h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={isAdmin}
                    onChange={e => setIsAdmin(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[#d8cc97] focus:ring-[#d8cc97]"
                  />
                  <label htmlFor="isAdmin" className="text-sm text-zinc-300">
                    Admin (can manage teams and players)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isSuperAdmin"
                    checked={isSuperAdmin}
                    onChange={e => setIsSuperAdmin(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[#d8cc97] focus:ring-[#d8cc97]"
                  />
                  <label
                    htmlFor="isSuperAdmin"
                    className="text-sm text-zinc-300"
                  >
                    Super Admin (full system access)
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <UniversalButton.Primary type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Coach'}
                </UniversalButton.Primary>
              </div>
            </form>
          </div>
        </div>
      }
    />
  );
}
