'use client';

import { useState, useEffect } from 'react';
import { UniversalButton } from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface Team {
  id: string;
  name: string;
  coachName?: string;
}

interface TeamSelectorProps {
  onSelect: (teamId: string) => void;
  onBack?: () => void;
}

export function TeamSelector({ onSelect, onBack }: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/teams');
        const data = await response.json();

        if (data.teams) {
          const transformedTeams = data.teams.map((team: any) => ({
            id: team.id,
            name: team.name || 'Unknown Team',
            coachName: team.coachName,
          }));

          setTeams(transformedTeams);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="text-center py-8 text-white">Loading teams...</div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-center text-white">
                Select Team
              </h2>
              {onBack && (
                <UniversalButton.Secondary
                  size="sm"
                  onClick={onBack}
                  className="text-sm"
                >
                  ← Back
                </UniversalButton.Secondary>
              )}
            </div>

            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
            />

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTeams.length === 0 ? (
                <div className="text-center py-4 text-gray-300">
                  No teams found
                </div>
              ) : (
                filteredTeams.map(team => (
                  <UniversalButton.Secondary
                    key={team.id}
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => onSelect(team.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-white">{team.name}</div>
                      {team.coachName && (
                        <div className="text-sm text-gray-300">
                          Coach: {team.coachName}
                        </div>
                      )}
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
