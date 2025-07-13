'use client'

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import UniversalButton from '@/components/ui/UniversalButton';
import { Users, Award, Calendar, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    activePlans: 0,
    recentObservations: 0
  });

  useEffect(() => {
    setStats({
      totalPlayers: 12,
      totalTeams: 3,
      activePlans: 8,
      recentObservations: 15
    });
  }, []);

  return (
    <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
      {/* Header - exact replica with coach info */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
        <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">Coach</span>
          <span className="text-xs text-[#d8cc97] leading-tight">coach@example.com</span>
          <span className="text-xs text-white leading-tight">Coach</span>
        </div>
      </header>
      {/* Sidebar */}
      <Sidebar user={{ name: 'Coach', email: 'coach@example.com', role: 'Coach' }} />
      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
        {/* LEFT COLUMN: Stats Overview */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Stats Overview</h2>
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Players</p>
                <p className="text-2xl font-bold text-white">{stats.totalPlayers}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Teams</p>
                <p className="text-2xl font-bold text-white">{stats.totalTeams}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Active Plans</p>
                <p className="text-2xl font-bold text-white">{stats.activePlans}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Recent Observations</p>
                <p className="text-2xl font-bold text-white">{stats.recentObservations}</p>
              </div>
            </div>
          </div>
        </div>
        {/* CENTER COLUMN: Quick Actions */}
        <div className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <a href="/players">
              <UniversalButton.Primary>View All Players</UniversalButton.Primary>
            </a>
            <a href="/development-plans">
              <UniversalButton.Secondary>Development Plans</UniversalButton.Secondary>
            </a>
            <a href="/observations">
              <UniversalButton.Secondary>View Observations</UniversalButton.Secondary>
            </a>
            <a href="/teams">
              <UniversalButton.Secondary>Manage Teams</UniversalButton.Secondary>
            </a>
            <a href="/analytics">
              <UniversalButton.Secondary>View Analytics</UniversalButton.Secondary>
            </a>
            <a href="/settings">
              <UniversalButton.Secondary>Settings</UniversalButton.Secondary>
            </a>
          </div>
        </div>
        {/* RIGHT COLUMN: Recent Activity */}
        <div className="w-1/4 p-6 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">New player added to Team A</p>
                <p className="text-xs text-zinc-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Development plan updated for John Doe</p>
                <p className="text-xs text-zinc-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">New observation recorded for Team B</p>
                <p className="text-xs text-zinc-400">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
