'use client';

import React from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { Calendar, Target, BookOpen, MessageSquare, FileText } from 'lucide-react';

interface PlayerPortalDashboardProps {
  playerId: string;
  features: {
    playerPortal: boolean;
  };
}

export default function PlayerPortalDashboard({ playerId, features }: PlayerPortalDashboardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _playerId = playerId;
  // This component is a stub - will be fully implemented when playerPortal feature is enabled
  if (!features.playerPortal) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#d8cc97]">My Player Portal</h1>
        <UniversalButton.Secondary>
          <FileText className="h-4 w-4 mr-2" />
          Export My Data
        </UniversalButton.Secondary>
      </div>

      {/* Development Plan Section */}
      <UniversalCard.Default title="My Development Plan">
        <div className="flex items-center space-x-4">
          <Target className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-sm text-zinc-400">Current Focus</p>
            <p className="text-lg font-semibold text-white">Ball Handling & Shooting</p>
          </div>
        </div>
        <div className="mt-4">
          <UniversalButton.Primary>
            View Full Plan
          </UniversalButton.Primary>
        </div>
      </UniversalCard.Default>

      {/* Skill Challenges Section */}
      <UniversalCard.Default title="My Skill Challenges">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-white">Dribble Drills</p>
                <p className="text-xs text-zinc-400">Complete 3 sessions</p>
              </div>
            </div>
            <span className="text-sm text-green-500">2/3 Complete</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-white">Free Throw Practice</p>
                <p className="text-xs text-zinc-400">Make 50 free throws</p>
              </div>
            </div>
            <span className="text-sm text-yellow-500">35/50 Complete</span>
          </div>
        </div>
      </UniversalCard.Default>

      {/* Practice Schedule Section */}
      <UniversalCard.Default title="My Practice Schedule">
        <div className="flex items-center space-x-4">
          <Calendar className="h-8 w-8 text-purple-500" />
          <div>
            <p className="text-sm text-zinc-400">Next Practice</p>
            <p className="text-lg font-semibold text-white">Tomorrow at 4:00 PM</p>
            <p className="text-sm text-zinc-400">Team Practice - Shooting Focus</p>
          </div>
        </div>
        <div className="mt-4">
          <UniversalButton.Secondary>
            View Full Schedule
          </UniversalButton.Secondary>
        </div>
      </UniversalCard.Default>

      {/* Coach Feedback Section */}
      <UniversalCard.Default title="Recent Coach Feedback">
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">Great improvement on defense!</p>
              <p className="text-xs text-zinc-400">Coach Johnson - 2 days ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <MessageSquare className="h-5 w-5 text-green-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">Keep working on your shooting form</p>
              <p className="text-xs text-zinc-400">Coach Johnson - 1 week ago</p>
            </div>
          </div>
        </div>
      </UniversalCard.Default>

      {/* Player Journal Section */}
      <UniversalCard.Default title="My Journal">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Today's Practice Reflection</p>
              <p className="text-xs text-zinc-400">Felt good about my shooting today...</p>
            </div>
            <UniversalButton.Secondary size="sm">
              Edit
            </UniversalButton.Secondary>
          </div>
        </div>
        <div className="mt-4">
          <UniversalButton.Primary>
            Add New Entry
          </UniversalButton.Primary>
        </div>
      </UniversalCard.Default>
    </div>
  );
} 