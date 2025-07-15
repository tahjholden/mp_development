'use client';

import React from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { Target, TrendingUp, Calendar } from 'lucide-react';

interface PlayerDevelopmentPlanProps {
  playerId: string;
  features: {
    playerPortal: boolean;
  };
}

export default function PlayerDevelopmentPlan({
  playerId,
  features,
}: PlayerDevelopmentPlanProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _playerId = playerId;
  // This component is a stub - will reuse existing PDP logic when playerPortal feature is enabled
  if (!features.playerPortal) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#d8cc97]">
          My Development Plan
        </h2>
        <UniversalButton.Secondary>
          <Calendar className="h-4 w-4 mr-2" />
          View History
        </UniversalButton.Secondary>
      </div>

      {/* Current Goals */}
      <UniversalCard.Default title="Current Goals">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <Target className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Improve Ball Handling
              </p>
              <p className="text-xs text-zinc-400">
                Complete daily dribble drills
              </p>
            </div>
            <span className="text-sm text-green-500">75%</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <Target className="h-5 w-5 text-purple-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Increase Shooting Accuracy
              </p>
              <p className="text-xs text-zinc-400">Practice 100 shots daily</p>
            </div>
            <span className="text-sm text-yellow-500">60%</span>
          </div>
        </div>
      </UniversalCard.Default>

      {/* Progress Tracking */}
      <UniversalCard.Default title="Progress Tracking">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Overall Progress</span>
            <span className="text-lg font-bold text-white">68%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: '68%' }}
            ></div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>+12% this month</span>
          </div>
        </div>
      </UniversalCard.Default>

      {/* Recent Activities */}
      <UniversalCard.Default title="Recent Activities">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-white">
                Completed dribble drill session
              </p>
              <p className="text-xs text-zinc-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-white">Coach updated your plan</p>
              <p className="text-xs text-zinc-400">1 day ago</p>
            </div>
          </div>
        </div>
      </UniversalCard.Default>
    </div>
  );
}
