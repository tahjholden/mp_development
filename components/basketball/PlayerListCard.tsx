'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';

import UniversalButton from '@/components/ui/UniversalButton';
import { cn } from '@/lib/utils';

// Types for the player and team data
export type PlayerStatus = 'active' | 'archived' | 'inactive';

export interface Player {
  id: string;
  name: string;
  teamId?: string;
  team?: string;
  status?: PlayerStatus;
  [key: string]: unknown; // For additional player properties
}

export interface Team {
  id: string;
  name: string;
}

interface PlayerListCardProps {
  players: Player[];
  teams?: Team[];
  selectedPlayerId?: string | undefined;
  selectedPlayerIds?: string[]; // For multi-select
  onPlayerSelect?: (player: Player) => void;
  onAddPlayer?: () => void;
  className?: string;
  title?: string;
  showSearch?: boolean;
  showTeamFilter?: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  maxHeight?: string;
  hasDevelopmentPlan?: (playerId: string) => boolean; // Function to check if player has development plan
  multiSelect?: boolean; // Enable multi-select mode
  allTeams?: Team[]; // All available teams for filtering
}

const PlayerListCard = ({
  players,
  teams = [],
  selectedPlayerId,
  selectedPlayerIds = [],
  onPlayerSelect,
  onAddPlayer,
  className,
  title = 'Players',
  showSearch = true,
  showTeamFilter = true,
  emptyStateMessage = 'No players found',
  emptyStateAction,
  maxHeight = '600px',
  hasDevelopmentPlan,
  multiSelect = false,
  allTeams = [],
}: PlayerListCardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Use allTeams for filtering if available, otherwise use teams prop
  const availableTeams = allTeams.length > 0 ? allTeams : teams;

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTeam =
        selectedTeamId === 'all' ||
        player.teamId === selectedTeamId ||
        player.team ===
          availableTeams.find(team => team.id === selectedTeamId)?.name;
      return matchesSearch && matchesTeam;
    });
  }, [players, searchTerm, selectedTeamId, availableTeams]);

  const selectedTeamName = useMemo(() => {
    if (selectedTeamId === 'all') return 'All Teams';
    const team = allTeams.find(team => team.id === selectedTeamId);
    return team ? team.name : 'All Teams';
  }, [selectedTeamId, allTeams]);

  const isPlayerSelected = (playerId: string) => {
    if (multiSelect) {
      return selectedPlayerIds.includes(playerId);
    }
    return selectedPlayerId === playerId;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <h2 className="text-xl font-bold mb-6 text-[#d8cc97]">{title}</h2>
      <div className="flex flex-col h-full">
        <div className="px-4 pb-2 space-y-2">
          {showSearch && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-1.5 pl-8 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {showTeamFilter && availableTeams.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
              >
                <span>{selectedTeamName}</span>
                {isTeamDropdownOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {isTeamDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto py-1">
                    <button
                      onClick={() => {
                        setSelectedTeamId('all');
                        setIsTeamDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-700',
                        selectedTeamId === 'all'
                          ? 'bg-zinc-700 text-gold-500'
                          : 'text-white'
                      )}
                    >
                      All Teams
                    </button>

                    {availableTeams.map(team => (
                      <button
                        key={team.id}
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setIsTeamDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-700',
                          selectedTeamId === team.id
                            ? 'bg-zinc-700 text-gold-500'
                            : 'text-white'
                        )}
                      >
                        {team.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="overflow-y-auto px-4 pb-4 space-y-2"
          style={{ maxHeight }}
        >
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, index) => {
              const hasPlan = hasDevelopmentPlan
                ? hasDevelopmentPlan(player.id)
                : false;
              const isSelected = isPlayerSelected(player.id);

              return (
                <div
                  key={`${player.id}-${player.name}-${index}`}
                  onClick={() => onPlayerSelect && onPlayerSelect(player)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    hasPlan ? 'border-[#d8cc97]' : 'border-red-500'
                  } ${isSelected ? 'bg-zinc-800' : 'bg-zinc-800/50 hover:bg-zinc-800'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{player.name}</p>
                      <p className="text-sm text-zinc-400">{player.team}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-zinc-400 text-sm mb-4">{emptyStateMessage}</p>
              {emptyStateAction}
            </div>
          )}
        </div>

        {onAddPlayer && (
          <div className="px-4 pt-2 pb-4">
            <UniversalButton.Primary onClick={onAddPlayer} className="w-full">
              Add Player
            </UniversalButton.Primary>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerListCard;
