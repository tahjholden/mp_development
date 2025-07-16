'use client';

import { useState, useEffect } from 'react';
import { UniversalButton } from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface Organization {
  id: string;
  name: string;
}

interface OrganizationSelectorProps {
  onSelect: (orgId: string) => void;
}

export function OrganizationSelector({ onSelect }: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        // For now, using mock data since we don't have an orgs API endpoint
        // TODO: Replace with actual API call when available
        const mockOrganizations = [
          { id: 'org1', name: 'MPBC' },
          { id: 'org2', name: 'Test Organization' },
        ];

        setOrganizations(mockOrganizations);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
          <UniversalCard.Default
            color="gold"
            size="lg"
            className="border-2 border-yellow-500"
          >
            <div className="text-center py-8 text-white">
              Loading organizations...
            </div>
          </UniversalCard.Default>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <UniversalCard.Default
          color="gold"
          size="lg"
          className="border-2 border-yellow-500"
        >
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-white">
              Select Organization
            </h2>

            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
            />

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredOrganizations.length === 0 ? (
                <div className="text-center py-4 text-gray-300">
                  No organizations found
                </div>
              ) : (
                filteredOrganizations.map(org => (
                  <UniversalButton.Secondary
                    key={org.id}
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => onSelect(org.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-white">{org.name}</div>
                    </div>
                  </UniversalButton.Secondary>
                ))
              )}
            </div>
          </div>
        </UniversalCard.Default>
      </div>
    </div>
  );
} 