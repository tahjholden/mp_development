'use client';

import React from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

interface PlayerSkillChallengesProps {
  playerId: string;
  features: {
    playerPortal: boolean;
  };
}

export default function PlayerSkillChallenges({
  playerId,
  features,
}: PlayerSkillChallengesProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _playerId = playerId;
  if (!features.playerPortal) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#d8cc97]">Skill Challenges</h2>
        <UniversalButton.Secondary>
          <Trophy className="h-4 w-4 mr-2" />
          View Leaderboard
        </UniversalButton.Secondary>
      </div>

      {/* Active Challenges */}
      <UniversalCard.Default title="Active Challenges">
        <div className="space-y-4">
          <div className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Dribble Master</h3>
              <span className="text-xs text-green-500">2/3 Complete</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Complete 3 dribble drill sessions
            </p>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Due in 3 days</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">
                Free Throw Champion
              </h3>
              <span className="text-xs text-yellow-500">35/50 Complete</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Make 50 free throws in practice
            </p>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Due in 1 week</span>
            </div>
          </div>
        </div>
      </UniversalCard.Default>

      {/* Completed Challenges */}
      <UniversalCard.Default title="Completed Challenges">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Defense Fundamentals
              </p>
              <p className="text-xs text-zinc-400">Completed 2 weeks ago</p>
            </div>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Passing Accuracy</p>
              <p className="text-xs text-zinc-400">Completed 1 month ago</p>
            </div>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
        </div>
      </UniversalCard.Default>
    </div>
  );
}
