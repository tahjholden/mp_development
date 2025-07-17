'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import UniversalButton from '@/components/ui/UniversalButton';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function AddCoachModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserRole();

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-add-coach-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-add-coach-modal', handleOpenModal);
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
        // Success! Close modal and reset form
        setIsOpen(false);
        resetForm();
        // Optionally trigger a refresh of coach data
        window.dispatchEvent(new CustomEvent('coach-added'));
      } else {
        // Handle error
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add coach'}`);
      }
    } catch (error) {
      console.error('Error adding coach:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setTeam('');
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  // If superadmin is checked, admin should also be checked
  useEffect(() => {
    if (isSuperAdmin) {
      setIsAdmin(true);
    }
  }, [isSuperAdmin]);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Coach">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
              required
            />
          </div>
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

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-medium text-zinc-300">Permissions</h3>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
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
              onChange={(e) => setIsSuperAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[#d8cc97] focus:ring-[#d8cc97]"
            />
            <label htmlFor="isSuperAdmin" className="text-sm text-zinc-300">
              Super Admin (full system access)
            </label>
          </div>
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
            {isSubmitting ? 'Adding...' : 'Add Coach'}
          </UniversalButton.Primary>
        </div>
      </form>
    </Modal>
  );
}