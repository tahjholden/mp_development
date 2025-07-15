'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { Users, Award, Calendar, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    activePlans: 0,
    recentObservations: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    // This would typically fetch from your API
    setStats({
      totalPlayers: 12,
      totalTeams: 3,
      activePlans: 8,
      recentObservations: 15,
    });
  }, []);

  return (
    <DashboardLayout
      center={
        <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UniversalCard.Default>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">
                  Total Players
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalPlayers}
                </p>
              </div>
            </div>
          </UniversalCard.Default>

          <UniversalCard.Default>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Teams</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalTeams}
                </p>
              </div>
            </div>
          </UniversalCard.Default>

          <UniversalCard.Default>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.activePlans}
                </p>
              </div>
            </div>
          </UniversalCard.Default>

          <UniversalCard.Default>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">
                  Recent Observations
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.recentObservations}
                </p>
              </div>
            </div>
          </UniversalCard.Default>
        </div>

        {/* Quick Actions */}
        <UniversalCard.Default title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/players">
              <UniversalButton.Primary>
                View All Players
              </UniversalButton.Primary>
            </a>

            <a href="/development-plans">
              <UniversalButton.Secondary>
                Development Plans
              </UniversalButton.Secondary>
            </a>

            <a href="/observations">
              <UniversalButton.Secondary>
                View Observations
              </UniversalButton.Secondary>
            </a>

            <a href="/teams">
              <UniversalButton.Secondary>
                Manage Teams
              </UniversalButton.Secondary>
            </a>

            <a href="/analytics">
              <UniversalButton.Secondary>
                View Analytics
              </UniversalButton.Secondary>
            </a>

            <a href="/settings">
              <UniversalButton.Secondary>Settings</UniversalButton.Secondary>
            </a>
          </div>
        </UniversalCard.Default>

        {/* Recent Activity */}
        <UniversalCard.Default title="Recent Activity">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  New player added to Team A
                </p>
                <p className="text-xs text-zinc-400">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  Development plan updated for John Doe
                </p>
                <p className="text-xs text-zinc-400">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  New observation recorded for Team B
                </p>
                <p className="text-xs text-zinc-400">6 hours ago</p>
              </div>
            </div>
          </div>
        </UniversalCard.Default>
      </div>
    } />
  );
}
