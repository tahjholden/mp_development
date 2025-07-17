'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UniversalButton from '@/components/ui/UniversalButton';

export default function AddOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // User data not needed for organization creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          website,
        }),
      });

      if (response.ok) {
        // Success! Navigate back to organizations page
        router.push('/organizations');
      } else {
        // Handle error
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add organization'}`);
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
            <h1 className="text-2xl font-bold text-white">
              Add New Organization
            </h1>
            <UniversalButton.Secondary onClick={() => router.back()}>
              Cancel
            </UniversalButton.Secondary>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Website (Optional)
                </label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d8cc97]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <UniversalButton.Primary type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Organization'}
                </UniversalButton.Primary>
              </div>
            </form>
          </div>
        </div>
      }
    />
  );
}
