'use client';

import React from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { Edit, Calendar, Star } from 'lucide-react';

interface PlayerJournalProps {
  playerId: string;
  features: {
    playerPortal: boolean;
  };
}

export default function PlayerJournal({ playerId, features }: PlayerJournalProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _playerId = playerId;
  if (!features.playerPortal) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#d8cc97]">My Journal</h2>
        <UniversalButton.Primary>
          <Edit className="h-4 w-4 mr-2" />
          New Entry
        </UniversalButton.Primary>
      </div>

      {/* Recent Entries */}
      <UniversalCard.Default title="Recent Entries">
        <div className="space-y-4">
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Today's Practice Reflection</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-zinc-400">4.5</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              Felt good about my shooting today. Made 8/10 free throws in practice. 
              Need to work on my defensive positioning though.
            </p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Today</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Game Day Thoughts</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-zinc-400">5.0</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              Great game today! Scored 15 points and had 3 assists. 
              Team played really well together.
            </p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">2 days ago</span>
            </div>
          </div>
        </div>
      </UniversalCard.Default>
    </div>
  );
} 