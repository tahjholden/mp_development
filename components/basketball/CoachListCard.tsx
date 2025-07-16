'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';

import UniversalButton from '@/components/ui/UniversalButton';
import { cn } from '@/lib/utils';

// Types for the coach data
export interface Coach {
  id: string;
  name: string;
  team: string;
  personType?: string; // For displaying role information
  [key: string]: unknown; // For additional coach properties
}

export interface Team {
  id: string;
  name: string;
}

interface CoachListCardProps {
  coaches: Coach[];
  selectedCoachId?: string | undefined;
  onCoachSelect?: (coach: Coach) => void;
  onAddCoach?: () => void;
  className?: string;
  title?: string;
  showSearch?: boolean;
  showTeamFilter?: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  maxHeight?: string;
  allTeams?: Team[]; // All available teams for filtering
}

const CoachListCard = ({
  coaches,
  selectedCoachId,
  onCoachSelect,
  onAddCoach,
  className,
  title = 'Coaches',
  showSearch = true,
  showTeamFilter = true,
  emptyStateMessage = 'No coaches found',
  emptyStateAction,
  maxHeight = '600px',
  allTeams = [],
}: CoachListCardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Use allTeams for filtering if available, otherwise extract unique teams from coaches
  const availableTeams =
    allTeams.length > 0
      ? allTeams
      : Array.from(new Set(coaches.map(coach => coach.team)))
          .filter(teamName => teamName && teamName.trim() !== '')
          .map(teamName => ({
            id: teamName,
            name: teamName,
          }));

  const filteredCoaches = useMemo(() => {
    // Remove duplicates based on coach ID and sort alphabetically
    const uniqueCoaches = coaches.filter(
      (coach, index, self) => index === self.findIndex(c => c.id === coach.id)
    );

    const sortedCoaches = uniqueCoaches.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return sortedCoaches.filter(coach => {
      const matchesSearch =
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.team.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam =
        selectedTeamId === 'all' ||
        coach.team ===
          availableTeams.find(team => team.id === selectedTeamId)?.name;
      return matchesSearch && matchesTeam;
    });
  }, [coaches, searchTerm, selectedTeamId, availableTeams]);

  const selectedTeamName = useMemo(() => {
    if (selectedTeamId === 'all') return 'All Teams';
    const team = availableTeams.find(team => team.id === selectedTeamId);
    return team ? team.name : 'All Teams';
  }, [selectedTeamId, availableTeams]);

  const isCoachSelected = (coachId: string) => {
    return selectedCoachId === coachId;
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
                placeholder="Search coaches..."
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
          {filteredCoaches.length > 0 ? (
            filteredCoaches.map(coach => {
              const isSelected = isCoachSelected(coach.id);

              return (
                <div
                  key={coach.id}
                  onClick={() => onCoachSelect && onCoachSelect(coach)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-zinc-800 border-[#d8cc97]'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 border-[#d8cc97]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{coach.name}</p>
                      <p className="text-sm text-zinc-400">
                        {coach.team}
                        {coach.personType &&
                          (coach.personType === 'admin' ||
                            coach.personType === 'superadmin') && (
                            <span className="ml-2 text-xs text-zinc-500">
                              ({coach.personType})
                            </span>
                          )}
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

        {onAddCoach && (
          <div className="px-4 pt-2 pb-4">
            <UniversalButton.Primary onClick={onAddCoach} className="w-full">
              Add Coach
            </UniversalButton.Primary>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachListCard;
