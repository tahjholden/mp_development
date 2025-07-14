import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Search, Filter } from 'lucide-react';
import UniversalButton from '@/components/ui/UniversalButton';
import type { Player, PlayerStatus } from './PlayerListCard';

interface Team {
  id: string;
  name: string;
}

interface PlayersListProps {
  playersById?: Record<string, Player>;
  playerIds?: string[];
  teams?: Team[];
  onPlayerSelect: (player: Player) => void;
  selectedPlayer?: Player | null;
  selectedPlayerId?: string;
  onAddPlayer?: () => void;
  title?: string;
  showSearch?: boolean;
  showTeamFilter?: boolean;
  maxHeight?: string;
}

const PlayersList: React.FC<PlayersListProps> = ({
  playersById = {},
  playerIds = [],
  teams = [],
  onPlayerSelect,
  selectedPlayer,
  onAddPlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Filter players based on search and team filter
  const filteredPlayers = playerIds
    .map(id => playersById[id])
    .filter(
      (player: Player | undefined): player is Player => !!player && !!player.id
    )
    .filter(player => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
      return matchesSearch && matchesTeam;
    });
  // Deduplicate by player.id before sorting and rendering
  const dedupedPlayers = Array.from(
    new Map(filteredPlayers.map(p => [p.id, p])).values()
  );
  const sortedPlayers = [...dedupedPlayers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#d8cc97] mt-0">Players</h2>
        <UniversalButton.Primary
          size="sm"
          onClick={onAddPlayer}
          leftIcon={<Plus size={16} />}
        >
          Add Player
        </UniversalButton.Primary>
      </div>
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
        />
      </div>
      {/* Team Filter */}
      <div className="relative mb-6">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
        <div className="relative">
          <button
            onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
            className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm text-white border border-zinc-700 focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
          >
            <span>{teamFilter === 'all' ? 'All Teams' : teamFilter}</span>
            <span className="text-zinc-400">▼</span>
          </button>
          {isTeamDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  setTeamFilter('all');
                  setIsTeamDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700"
              >
                All Teams
              </button>
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => {
                    setTeamFilter(team.name);
                    setIsTeamDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700"
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Player List - Fixed height for exactly 10 player cards */}
      <div
        className="flex-1 overflow-y-auto space-y-2"
        style={{ maxHeight: '400px' }} // Exactly 10 player cards (10 * 40px)
      >
        {sortedPlayers.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="text-zinc-700 w-12 h-12 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">No players found</p>
          </div>
        ) : (
          sortedPlayers.map((player: Player) => (
            <div
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedPlayer?.id === player.id
                  ? 'bg-[#d8cc97]/20 border border-[#d8cc97]'
                  : 'bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{player.name}</p>
                  <p className="text-sm text-zinc-400">{player.team}</p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    player.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default PlayersList;
