'use client';

import { useState, useEffect } from 'react';
import { UniversalButton } from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface Player {
  id: string;
  name: string;
  team: string;
}

interface PlayerSelectorProps {
  teamId?: string;
  onSelect: (playerId: string, playerName: string) => void;
  onBack?: () => void;
}

export function PlayerSelector({
  teamId,
  onSelect,
  onBack,
}: PlayerSelectorProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/players?limit=1000');
        const data = await response.json();

        if (data.players) {
          const transformedPlayers = data.players.map((player: any) => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            team: player.team || 'No Team',
          }));

          // Only filter by team if teamId is provided
          const filteredPlayers = teamId
            ? transformedPlayers.filter(
                (player: Player) => player.team === teamId
              )
            : transformedPlayers;

          setPlayers(filteredPlayers);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [teamId]);

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              Loading players...
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-center text-white">
                Select Player
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
              placeholder="Search players..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
            />

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-4 text-gray-300">
                  No players found
                </div>
              ) : (
                filteredPlayers.map(player => (
                  <UniversalButton.Secondary
                    key={player.id}
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => onSelect(player.id, player.name)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-white">
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-300">{player.team}</div>
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
