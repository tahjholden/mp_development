'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { cn } from '@/lib/utils';

// Types for the player and team data
export type PlayerStatus = 'active' | 'archived' | 'inactive';

export interface Player {
  id: string;
  name: string;
  teamId?: string;
  status?: PlayerStatus;
  [key: string]: any; // For additional player properties
}

export interface Team {
  id: string;
  name: string;
}

interface PlayerListCardProps {
  players: Player[];
  teams?: Team[];
  selectedPlayerId?: string;
  onPlayerSelect?: (player: Player) => void;
  onAddPlayer?: () => void;
  className?: string;
  title?: string;
  showSearch?: boolean;
  showTeamFilter?: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  maxHeight?: string;
}

const PlayerListCard = ({
  players,
  teams = [],
  selectedPlayerId,
  onPlayerSelect,
  onAddPlayer,
  className,
  title = 'Players',
  showSearch = true,
  showTeamFilter = true,
  emptyStateMessage = 'No players found',
  emptyStateAction,
  maxHeight = '600px',
}: PlayerListCardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTeam =
        selectedTeamId === 'all' || player.teamId === selectedTeamId;
      return matchesSearch && matchesTeam;
    });
  }, [players, searchTerm, selectedTeamId]);

  const selectedTeamName = useMemo(() => {
    if (selectedTeamId === 'all') return 'All Teams';
    const team = teams.find(team => team.id === selectedTeamId);
    return team ? team.name : 'All Teams';
  }, [selectedTeamId, teams]);

  return (
    <UniversalCard.Default
      title={title}
      className={cn('flex flex-col h-full', className)}
      contentClassName="flex-1 p-0 overflow-hidden"
    >
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

        {showTeamFilter && teams.length > 0 && (
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

                  {teams.map(team => (
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
        className={cn(
          className ? className : 'overflow-y-auto px-4 pb-4 space-y-2',
          !className && 'overflow-y-auto px-4 pb-4'
        )}
        style={{ maxHeight }}
      >
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player, index) => (
            <UniversalCard.PlayerStatus
              key={`${player.id}-${player.name}-${index}`}
              status={player.status || 'active'}
              selected={player.id === selectedPlayerId}
              hover="border"
              className="cursor-pointer transition-all"
              onClick={() => onPlayerSelect && onPlayerSelect(player)}
              size="sm"
            >
              <div className="py-1.5 px-2">
                <p className="font-medium text-sm">{player.name}</p>
              </div>
            </UniversalCard.PlayerStatus>
          ))
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
    </UniversalCard.Default>
  );
};

export default PlayerListCard;
