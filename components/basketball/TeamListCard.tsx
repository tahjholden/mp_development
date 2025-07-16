'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

import UniversalButton from '@/components/ui/UniversalButton';
import { cn } from '@/lib/utils';

// Types for the team data
export interface Team {
  id: string;
  name: string;
  coachName: string;
  [key: string]: unknown; // For additional team properties
}

interface TeamListCardProps {
  teams: Team[];
  selectedTeamId?: string | undefined;
  onTeamSelect?: (team: Team) => void;
  onAddTeam?: () => void;
  className?: string;
  title?: string;
  showSearch?: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  maxHeight?: string;
}

const TeamListCard = ({
  teams,
  selectedTeamId,
  onTeamSelect,
  onAddTeam,
  className,
  title = 'Teams',
  showSearch = true,
  emptyStateMessage = 'No teams found',
  emptyStateAction,
  maxHeight = '600px',
}: TeamListCardProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.coachName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [teams, searchTerm]);

  const isTeamSelected = (teamId: string) => {
    return selectedTeamId === teamId;
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
                placeholder="Search teams..."
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
        </div>

        <div
          className="overflow-y-auto px-4 pb-4 space-y-2"
          style={{ maxHeight }}
        >
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team, index) => {
              const isSelected = isTeamSelected(team.id);

              return (
                <div
                  key={`${team.id}-${team.name}-${index}`}
                  onClick={() => onTeamSelect && onTeamSelect(team)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 border-zinc-700 ${
                    isSelected
                      ? 'bg-zinc-800 border-[#d8cc97]'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{team.name}</p>
                      <p className="text-sm text-zinc-400">
                        Coach: {team.coachName}
                      </p>
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

        {onAddTeam && (
          <div className="px-4 pt-2 pb-4">
            <UniversalButton.Primary onClick={onAddTeam} className="w-full">
              Add Team
            </UniversalButton.Primary>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamListCard;
