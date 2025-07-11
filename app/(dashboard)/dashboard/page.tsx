'use client';

import React from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  ClipboardList, 
  ArrowUpRight, 
  Clock, 
  Bell, 
  ChevronRight, 
  CalendarPlus,
  UserPlus,
  ClipboardPlus
} from 'lucide-react';

const mockStats = [
  { title: 'Total Players', value: 42, icon: <Users size={24} className="text-gold-500" />, change: '+3', period: 'from last month' },
  { title: 'Active Teams', value: 5, icon: <Users size={24} className="text-gold-500" />, change: '+1', period: 'from last month' },
  { title: 'Upcoming Sessions', value: 12, icon: <Calendar size={24} className="text-gold-500" />, change: '+5', period: 'from last week' },
  { title: 'Total Drills', value: 86, icon: <ClipboardList size={24} className="text-gold-500" />, change: '+8', period: 'from last month' },
];

const mockUpcomingSessions = [
  { id: 1, title: 'Team Practice - Varsity', date: '2025-07-11', time: '16:00', location: 'Main Court', players: 12 },
  { id: 2, title: 'Shooting Drills - Advanced', date: '2025-07-12', time: '14:30', location: 'Training Room', players: 8 },
  { id: 3, title: 'Junior Development', date: '2025-07-13', time: '10:00', location: 'Secondary Court', players: 15 },
];

const mockRecentActivities = [
  { id: 1, type: 'player_added', message: 'New player Michael Johnson added to Varsity team', time: '2 hours ago' },
  { id: 2, type: 'session_completed', message: 'Shooting Drills session completed with 8 players', time: '1 day ago' },
  { id: 3, type: 'observation_added', message: 'New observation added for player Sarah Williams', time: '2 days ago' },
  { id: 4, type: 'drill_created', message: 'New defensive drill "Zone Pressure" created', time: '3 days ago' },
  { id: 5, type: 'team_updated', message: 'Junior team roster updated with 3 new players', time: '4 days ago' },
];

const mockPlayerPerformance = [
  { name: 'James Wilson', points: 18.5, rebounds: 7.2, assists: 4.3, trend: 'up' },
  { name: 'Sarah Williams', points: 15.2, rebounds: 3.1, assists: 6.8, trend: 'up' },
  { name: 'Marcus Johnson', points: 12.7, rebounds: 8.5, assists: 2.1, trend: 'down' },
  { name: 'Emma Davis', points: 14.3, rebounds: 4.2, assists: 5.6, trend: 'stable' },
];

export default function Dashboard() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockStats.map((stat, index) => (
          <UniversalCard.StatCard key={index} className="h-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2 text-white">{stat.value}</h3>
                <p className="flex items-center mt-1 text-xs text-gold-500">
                  <ArrowUpRight size={14} className="mr-1" />
                  {stat.change} {stat.period}
                </p>
              </div>
              <div className="p-3 rounded-full bg-zinc-800">
                {stat.icon}
              </div>
            </div>
          </UniversalCard.StatCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Sessions */}
          <UniversalCard.Default
            title="Upcoming Sessions"
            subtitle="Next 7 days"
            footer={
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-zinc-400">Showing {mockUpcomingSessions.length} of 12 sessions</span>
                <UniversalButton.Secondary size="sm" rightIcon={<ChevronRight size={16} />}>
                  View All
                </UniversalButton.Secondary>
              </div>
            }
          >
            <div className="space-y-4">
              {mockUpcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-gold-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{session.title}</p>
                    <div className="flex items-center mt-1">
                      <Clock size={14} className="text-zinc-400 mr-1" />
                      <p className="text-xs text-zinc-400">
                        {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {session.time}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <Users size={14} className="text-zinc-400 mr-1" />
                      <span className="text-xs text-zinc-400">{session.players} players</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{session.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </UniversalCard.Default>

          {/* Top Player Performance */}
          <UniversalCard.Default
            title="Top Player Performance"
            subtitle="Last 30 days"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Player</th>
                    <th className="pb-2 font-medium">PPG</th>
                    <th className="pb-2 font-medium">RPG</th>
                    <th className="pb-2 font-medium">APG</th>
                    <th className="pb-2 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPlayerPerformance.map((player, index) => (
                    <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-white">{player.name}</p>
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">{player.points}</td>
                      <td className="py-3 pr-4 text-zinc-300">{player.rebounds}</td>
                      <td className="py-3 pr-4 text-zinc-300">{player.assists}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          player.trend === 'up' ? 'bg-success-500/20 text-success-500' :
                          player.trend === 'down' ? 'bg-danger-500/20 text-danger-500' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>
                          {player.trend === 'up' ? '↑ Up' : 
                           player.trend === 'down' ? '↓ Down' : '→ Stable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </UniversalCard.Default>
        </div>

        {/* Right Column - Activities and Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <UniversalCard.Default title="Quick Actions">
            <div className="grid grid-cols-1 gap-3">
              <UniversalButton.Primary 
                leftIcon={<UserPlus size={16} />}
                className="justify-start"
              >
                Add New Player
              </UniversalButton.Primary>
              
              <UniversalButton.Primary 
                leftIcon={<CalendarPlus size={16} />}
                className="justify-start"
              >
                Schedule Session
              </UniversalButton.Primary>
              
              <UniversalButton.Primary 
                leftIcon={<ClipboardPlus size={16} />}
                className="justify-start"
              >
                Create New Drill
              </UniversalButton.Primary>
            </div>
          </UniversalCard.Default>

          {/* Recent Activity */}
          <UniversalCard.Default
            title="Recent Activity"
            subtitle="System updates and notifications"
          >
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center mr-3">
                    <Bell size={14} className="text-gold-500" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-zinc-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </UniversalCard.Default>

          {/* System Stats */}
          <UniversalCard.Default title="System Health">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-zinc-400">Storage</span>
                  <span className="text-xs text-zinc-400">75%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-gold-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-zinc-400">User Accounts</span>
                  <span className="text-xs text-zinc-400">42/50</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-gold-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-zinc-400">Video Storage</span>
                  <span className="text-xs text-zinc-400">40%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-gold-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </UniversalCard.Default>
        </div>
      </div>
    </section>
  );
}
