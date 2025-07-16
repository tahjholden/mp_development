'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

import UniversalButton from '@/components/ui/UniversalButton';
import { cn } from '@/lib/utils';

// Types for the coach data
export interface Coach {
  id: string;
  name: string;
  team: string;
  [key: string]: unknown; // For additional coach properties
}

interface CoachListCardProps {
  coaches: Coach[];
  selectedCoachId?: string | undefined;
  onCoachSelect?: (coach: Coach) => void;
  onAddCoach?: () => void;
  className?: string;
  title?: string;
  showSearch?: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  maxHeight?: string;
}

const CoachListCard = ({
  coaches,
  selectedCoachId,
  onCoachSelect,
  onAddCoach,
  className,
  title = 'Coaches',
  showSearch = true,
  emptyStateMessage = 'No coaches found',
  emptyStateAction,
  maxHeight = '600px',
}: CoachListCardProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCoaches = useMemo(() => {
    return coaches.filter(coach => {
      const matchesSearch =
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.team.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [coaches, searchTerm]);

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
        </div>

        <div
          className="overflow-y-auto px-4 pb-4 space-y-2"
          style={{ maxHeight }}
        >
          {filteredCoaches.length > 0 ? (
            filteredCoaches.map((coach, index) => {
              const isSelected = isCoachSelected(coach.id);

              return (
                <div
                  key={`${coach.id}-${coach.name}-${index}`}
                  onClick={() => onCoachSelect && onCoachSelect(coach)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 border-zinc-700 ${
                    isSelected
                      ? 'bg-zinc-800 border-[#d8cc97]'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{coach.name}</p>
                      <p className="text-sm text-zinc-400">
                        Team: {coach.team}
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
