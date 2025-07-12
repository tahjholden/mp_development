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
  ClipboardPlus,
  Loader2
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (res.status === 401) {
    // Return null for unauthorized requests - will be handled in component
    return null;
  }
  return res.json();
});

// Loading component for stats
const StatsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <UniversalCard.StatCard key={i} className="h-full">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-24"></div>
            <div className="h-8 bg-zinc-700 rounded w-16"></div>
            <div className="h-3 bg-zinc-700 rounded w-20"></div>
          </div>
          <div className="p-3 rounded-full bg-zinc-800">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        </div>
      </UniversalCard.StatCard>
    ))}
  </div>
);

// Loading component for sessions
const SessionsLoading = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center p-3 rounded-lg bg-zinc-800/50">
        <div className="flex-shrink-0 w-12 h-12 bg-zinc-700 rounded-lg mr-4"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-700 rounded w-32"></div>
          <div className="h-3 bg-zinc-700 rounded w-24"></div>
        </div>
        <div className="ml-4 space-y-2">
          <div className="h-3 bg-zinc-700 rounded w-16"></div>
          <div className="h-3 bg-zinc-700 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  // Fetch real data from API endpoints
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR('/api/dashboard/stats', fetcher);
  const { data: sessionsData, error: sessionsError, isLoading: sessionsLoading } = useSWR('/api/dashboard/sessions', fetcher);
  const { data: playersData, error: playersError, isLoading: playersLoading } = useSWR('/api/dashboard/players', fetcher);
  const { data: activitiesData, error: activitiesError, isLoading: activitiesLoading } = useSWR('/api/dashboard/activities', fetcher);

  // Transform stats data for display with fallbacks
  const stats = statsData ? [
    { title: 'Total Players', value: statsData.totalPlayers, icon: <Users size={24} className="text-gold-500" />, change: statsData.changes.players, period: 'from last month' },
    { title: 'Active Teams', value: statsData.activeTeams, icon: <Users size={24} className="text-gold-500" />, change: statsData.changes.teams, period: 'from last month' },
    { title: 'Upcoming Sessions', value: statsData.upcomingSessions, icon: <Calendar size={24} className="text-gold-500" />, change: statsData.changes.sessions, period: 'from last week' },
    { title: 'Total Drills', value: statsData.totalDrills, icon: <ClipboardList size={24} className="text-gold-500" />, change: statsData.changes.drills, period: 'from last month' },
  ] : [
    { title: 'Total Players', value: 0, icon: <Users size={24} className="text-gold-500" />, change: '+0', period: 'from last month' },
    { title: 'Active Teams', value: 0, icon: <Users size={24} className="text-gold-500" />, change: '+0', period: 'from last month' },
    { title: 'Upcoming Sessions', value: 0, icon: <Calendar size={24} className="text-gold-500" />, change: '+0', period: 'from last week' },
    { title: 'Total Drills', value: 0, icon: <ClipboardList size={24} className="text-gold-500" />, change: '+0', period: 'from last month' },
  ];

  // Use real activities data or fallback to empty array
  const recentActivities = activitiesData || [];

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Dashboard</h1>
      
      {/* Stats Overview */}
      {statsLoading ? (
        <StatsLoading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Sessions */}
          <UniversalCard.Default
            title="Upcoming Sessions"
            subtitle="Next 7 days"
            footer={
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-zinc-400">Showing {sessionsData?.length || 0} sessions</span>
                <UniversalButton.Secondary size="sm" rightIcon={<ChevronRight size={16} />}>
                  View All
                </UniversalButton.Secondary>
              </div>
            }
          >
            {sessionsLoading ? (
              <SessionsLoading />
            ) : (
              <div className="space-y-4">
                {(sessionsData || []).map((session: any) => (
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
                        <span className="text-xs text-zinc-400">{session.team}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{session.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </UniversalCard.Default>

          {/* Top Player Performance */}
          <UniversalCard.Default
            title="Top Player Performance"
            subtitle="Last 30 days"
          >
            {playersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-700 rounded w-24"></div>
                      <div className="h-3 bg-zinc-700 rounded w-16"></div>
                    </div>
                    <div className="ml-4 space-y-2">
                      <div className="h-3 bg-zinc-700 rounded w-12"></div>
                      <div className="h-3 bg-zinc-700 rounded w-12"></div>
                      <div className="h-3 bg-zinc-700 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                      <th className="pb-2 font-medium">Player</th>
                      <th className="pb-2 font-medium">Team</th>
                      <th className="pb-2 font-medium">Overall</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(playersData || []).slice(0, 4).map((player: any, index: number) => (
                      <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-white">{player.name}</p>
                          <p className="text-xs text-zinc-400">{player.position}</p>
                        </td>
                        <td className="py-3 pr-4 text-zinc-300">{player.team}</td>
                        <td className="py-3 pr-4 text-zinc-300">{player.performance.overall}%</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            player.status === 'active' ? 'bg-success-500/20 text-success-500' :
                            'bg-zinc-500/20 text-zinc-400'
                          }`}>
                            {player.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded-full mr-3"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-700 rounded w-48"></div>
                      <div className="h-3 bg-zinc-700 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {recentActivities.map((activity: any) => (
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
            )}
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
