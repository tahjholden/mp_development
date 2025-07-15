'use client';

import React from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface PlayerScheduleProps {
  playerId: string;
  features: {
    playerPortal: boolean;
  };
}

export default function PlayerSchedule({
  playerId,
  features,
}: PlayerScheduleProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _playerId = playerId;
  if (!features.playerPortal) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#d8cc97]">My Schedule</h2>
        <UniversalButton.Secondary>
          <Calendar className="h-4 w-4 mr-2" />
          Add Event
        </UniversalButton.Secondary>
      </div>

      {/* Upcoming Events */}
      <UniversalCard.Default title="Upcoming Events">
        <div className="space-y-4">
          <div className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Team Practice</h3>
              <span className="text-xs text-blue-500">Tomorrow</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">4:00 PM - 6:00 PM</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Main Gym</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Shooting Focus</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Game vs Eagles</h3>
              <span className="text-xs text-purple-500">Saturday</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">2:00 PM - 4:00 PM</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Away Game</span>
            </div>
          </div>
        </div>
      </UniversalCard.Default>
    </div>
  );
}
