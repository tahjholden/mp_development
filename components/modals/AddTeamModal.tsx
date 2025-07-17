'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import UniversalButton from '@/components/ui/UniversalButton';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function AddTeamModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserRole();

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-add-team-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-add-team-modal', handleOpenModal);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          description,
          organizationId: user?.organizationId,
        }),
      });

      if (response.ok) {
        // Success! Close modal and reset form
        setIsOpen(false);
        setTeamName('');
        setDescription('');
        // Optionally trigger a refresh of team data
        window.dispatchEvent(new CustomEvent('team-added'));
      } else {
        // Handle error
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add team'}`);
      }
    } catch (error) {
      console.error('Error adding team:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="teamName" className="block text-sm font-medium text-zinc-300">
            Team Name
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
          />
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
            {isSubmitting ? 'Adding...' : 'Add Team'}
          </UniversalButton.Primary>
        </div>
      </form>
    </Modal>
  );
}