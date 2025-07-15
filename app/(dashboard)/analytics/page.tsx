'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';
import { z } from 'zod';

// Zod schemas for validation
const AnalyticsMetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  change: z.number(),
  changeType: z.enum(['increase', 'decrease', 'neutral']),
  category: z.enum(['performance', 'attendance', 'development', 'team']),
  period: z.string(),
  target: z.number().optional(),
});
const AnalyticsMetricsArraySchema = z.array(AnalyticsMetricSchema);

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  status: z.string(),
  performance: z.number(),
  attendance: z.number(),
  observations: z.number(),
});
const PlayersArraySchema = z.array(PlayerSchema);

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  coachName: z.string().optional(),
  role: z.string().optional(),
  personType: z.string().optional(),
});
const TeamsArraySchema = z.array(TeamSchema);

// Types for analytics
interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  category: 'performance' | 'attendance' | 'development' | 'team';
  period: string;
  target?: number;
}

interface Player {
  id: string;
  name: string;
  team: string;
  status: string;
  performance: number;
  attendance: number;
  observations: number;
}

interface Team {
  id: string;
  name: string;
  coachName?: string;
  role?: string;
  personType?: string;
  performance?: number;
  attendance?: number;
  players?: number;
}

// Main component
export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player/team data for left column
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const filteredMetricsList = metrics.filter(metric => {
    const matchesSearch = metric.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || metric.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle metric selection with toggle functionality
  const handleMetricSelect = (metricId: string) => {
    if (selectedMetricId === metricId) {
      // Clicking the same metric again - show all metrics
      setSelectedMetricId(null);
    } else {
      // Clicking a different metric - filter to their details
      setSelectedMetricId(metricId);
    }
  };

  // Fetch real data with validation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock analytics data with validation - in real app, this would come from API
        const mockMetrics: AnalyticsMetric[] = [
          {
            id: '1',
            name: 'Average Player Performance',
            value: 78.5,
            change: 5.2,
            changeType: 'increase',
            category: 'performance',
            period: 'Last 30 days',
            target: 80,
          },
          {
            id: '2',
            name: 'Team Attendance Rate',
            value: 92.3,
            change: -2.1,
            changeType: 'decrease',
            category: 'attendance',
            period: 'Last 30 days',
            target: 95,
          },
          {
            id: '3',
            name: 'Development Plan Completion',
            value: 67.8,
            change: 12.5,
            changeType: 'increase',
            category: 'development',
            period: 'Last 30 days',
            target: 75,
          },
          {
            id: '4',
            name: 'Team Win Rate',
            value: 65.2,
            change: 8.7,
            changeType: 'increase',
            category: 'team',
            period: 'Last 30 days',
            target: 70,
          },
          {
            id: '5',
            name: 'Player Skill Improvement',
            value: 82.1,
            change: 3.4,
            changeType: 'increase',
            category: 'performance',
            period: 'Last 30 days',
            target: 85,
          },
          {
            id: '6',
            name: 'Practice Session Attendance',
            value: 88.9,
            change: 1.2,
            changeType: 'increase',
            category: 'attendance',
            period: 'Last 30 days',
            target: 90,
          },
        ];

        // Validate metrics data
        const validatedMetrics =
          AnalyticsMetricsArraySchema.safeParse(mockMetrics);
        if (!validatedMetrics.success) {
          throw new Error('Invalid metrics data received');
        }

        // Filter out any invalid metrics
        const validMetrics = validatedMetrics.data.filter(
          (metric): metric is AnalyticsMetric =>
            metric &&
            typeof metric === 'object' &&
            typeof metric.id === 'string' &&
            typeof metric.name === 'string' &&
            typeof metric.period === 'string' &&
            metric.id.trim() !== '' &&
            metric.name.trim() !== '' &&
            metric.period.trim() !== ''
        );

        // Deduplicate metrics by id
        const uniqueMetrics = Array.from(
          new Map(validMetrics.map(metric => [metric.id, metric])).values()
        );
        setMetrics(uniqueMetrics);

        // Fetch players with validation
        const playersResponse = await fetch(
          '/api/dashboard/players?offset=0&limit=10'
        );
        if (playersResponse.ok) {
          const rawPlayersData = await playersResponse.json();
          // Handle the API response structure: { players: [...], total: number }
          if (
            rawPlayersData &&
            rawPlayersData.players &&
            Array.isArray(rawPlayersData.players)
          ) {
            const transformedRawPlayers = rawPlayersData.players.map(
              (player: {
                id: string;
                name?: string;
                team?: string;
                status?: string;
              }) => ({
                id: player.id,
                name: player.name || 'Unknown Player',
                team: player.team || 'No Team',
                status: player.status || 'active',
                performance: Math.floor(Math.random() * 30) + 70,
                attendance: Math.floor(Math.random() * 20) + 80,
                observations: Math.floor(Math.random() * 10) + 5,
              })
            );

            // Validate players data
            const validatedPlayers = PlayersArraySchema.safeParse(
              transformedRawPlayers
            );
            if (!validatedPlayers.success) {
              throw new Error('Invalid players data received');
            }

            // Filter out any invalid players
            const validPlayers = validatedPlayers.data.filter(
              (player): player is Player =>
                player &&
                typeof player === 'object' &&
                typeof player.id === 'string' &&
                typeof player.name === 'string' &&
                typeof player.team === 'string' &&
                player.id.trim() !== '' &&
                player.name.trim() !== '' &&
                player.team.trim() !== ''
            );

            // Deduplicate players by id
            const uniquePlayers = Array.from(
              new Map(validPlayers.map(player => [player.id, player])).values()
            );
            setPlayers(uniquePlayers);
          } else {
            setPlayers([]);
          }
        }

        // Fetch teams with validation
        const teamsResponse = await fetch('/api/user/teams');
        if (teamsResponse.ok) {
          const rawTeamsData = await teamsResponse.json();

          // Validate teams data
          const validatedTeams = TeamsArraySchema.safeParse(rawTeamsData);
          if (!validatedTeams.success) {
            throw new Error('Invalid teams data received');
          }

          // Filter out any invalid teams and deduplicate by id
          const validTeams = validatedTeams.data.filter(
            (team): team is Team =>
              team &&
              typeof team === 'object' &&
              typeof team.id === 'string' &&
              typeof team.name === 'string' &&
              team.id.trim() !== '' &&
              team.name.trim() !== ''
          );

          const uniqueTeams = validTeams.map(team => ({
            ...team,
            performance: Math.floor(Math.random() * 30) + 70,
            attendance: Math.floor(Math.random() * 20) + 80,
            players: Math.floor(Math.random() * 10) + 10,
          }));

          const deduplicatedTeams = Array.from(
            new Map(uniqueTeams.map(team => [team.id, team])).values()
          );
          setTeams(deduplicatedTeams);
        }

        if (uniqueMetrics.length > 0 && uniqueMetrics[0]) {
          setSelectedMetric(uniqueMetrics[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setMetrics([]);
        setPlayers([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">
            Loading analytics...
          </span>
          <div className="w-8 h-8 border-2 border-[#d8cc97] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-[#161616] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      {/* Coming Soon Overlay */}
      <ComingSoonOverlay
        title="Analytics Coming Soon!"
        description="Our analytics dashboard is in development. You can see the layout and structure, but the data and charts are being built. Let us know what metrics you'd like to see!"
        feedbackLink="mailto:coach@example.com?subject=MPB%20Analytics%20Feedback"
      />

      {/* Header - exact replica with coach info */}
      <header
        className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between"
        style={{ boxShadow: 'none' }}
      >
        <span
          className="text-2xl font-bold tracking-wide text-[#d8cc97]"
          style={{ letterSpacing: '0.04em' }}
        >
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">
            Coach
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            coach@example.com
          </span>
          <span className="text-xs text-white leading-tight">Coach</span>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        user={{
          name: 'Coach',
          email: 'coach@example.com',
          role: 'Coach',
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen">
        {/* LEFT PANE: Metrics List */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Metrics
          </h2>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>

          {/* Category Filter */}
          <div className="relative mb-6">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full pl-10 pr-4 py-3 text-left bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
            >
              <span>
                {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
              </span>
              {isCategoryDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white"
                >
                  All Categories
                </button>
                {['performance', 'attendance', 'development', 'team'].map(
                  category => (
                    <button
                      key={category}
                      onClick={() => {
                        setCategoryFilter(category);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white capitalize"
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Metrics List */}
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredMetricsList.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No metrics found
              </div>
            ) : (
              filteredMetricsList.map(metric => (
                <div
                  key={metric.id}
                  onClick={() => handleMetricSelect(metric.id)}
                  className={`p-4 rounded cursor-pointer transition-all ${
                    selectedMetricId === metric.id
                      ? 'bg-[#d8cc97] text-black font-semibold'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <p className="font-medium">{metric.name}</p>
                  <p className="text-xs text-gray-400">
                    {metric.value}% • {metric.change > 0 ? '+' : ''}
                    {metric.change}%
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANE: Metric Details */}
        <div className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedMetricId
              ? `${metrics.find(m => m.id === selectedMetricId)?.name}`
              : 'All Metrics'}
          </h2>

          {selectedMetric ? (
            <div className="space-y-6">
              {/* Metric Details Card */}
              <div
                className="bg-zinc-800 p-6 rounded"
                style={{ background: '#181818' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#d8cc97]">
                      {selectedMetric.name}
                    </h3>
                    <p className="text-sm text-zinc-400 capitalize">
                      {selectedMetric.category} • {selectedMetric.period}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs text-[#d8cc97] font-semibold hover:underline bg-transparent">
                      Export
                    </button>
                    <button className="text-xs text-red-400 font-semibold hover:underline bg-transparent">
                      Share
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-zinc-400">Current Value</p>
                    <p className="text-white text-lg font-bold">
                      {selectedMetric.value}%
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Change</p>
                    <p
                      className={`text-white text-lg font-bold ${selectedMetric.changeType === 'increase' ? 'text-green-400' : selectedMetric.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'}`}
                    >
                      {selectedMetric.change > 0 ? '+' : ''}
                      {selectedMetric.change}%
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Target</p>
                    <p className="text-white">{selectedMetric.target}%</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Status</p>
                    <p
                      className={`text-white ${selectedMetric.value >= (selectedMetric.target || 0) ? 'text-green-400' : 'text-yellow-400'}`}
                    >
                      {selectedMetric.value >= (selectedMetric.target || 0)
                        ? 'On Track'
                        : 'Needs Attention'}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-[#d8cc97] h-2 rounded-full"
                    style={{ width: `${Math.min(selectedMetric.value, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Top Performers */}
              <div
                className="bg-zinc-800 p-6 rounded"
                style={{ background: '#181818' }}
              >
                <h4 className="text-base font-bold text-[#d8cc97] mb-4">
                  Top Performers
                </h4>
                <div className="space-y-2">
                  {players
                    .sort((a, b) => b.performance - a.performance)
                    .slice(0, 5)
                    .map(player => (
                      <div
                        key={player.id}
                        className="flex justify-between items-center p-2 bg-zinc-700 rounded"
                      >
                        <span className="text-sm text-white">
                          {player.name}
                        </span>
                        <span className="text-xs text-green-400">
                          {player.performance}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Select a metric to view details.
            </div>
          )}
        </div>

        {/* RIGHT PANE: Analytics Dashboard */}
        <div className="w-1/4 p-8 bg-black flex flex-col justify-start min-h-screen">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Dashboard
          </h2>

          {/* Quick Stats */}
          <div
            className="bg-zinc-800 p-6 rounded mb-6"
            style={{ background: '#181818' }}
          >
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Total Players</span>
                <span className="text-sm text-white font-semibold">
                  {players.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Active Teams</span>
                <span className="text-sm text-white font-semibold">
                  {teams.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Avg Performance</span>
                <span className="text-sm text-white font-semibold">
                  {Math.round(
                    players.reduce((sum, p) => sum + p.performance, 0) /
                      players.length
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Avg Attendance</span>
                <span className="text-sm text-white font-semibold">
                  {Math.round(
                    players.reduce((sum, p) => sum + p.attendance, 0) /
                      players.length
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div
            className="bg-zinc-800 p-6 rounded mb-6"
            style={{ background: '#181818' }}
          >
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Team Performance
            </h3>
            <div className="space-y-3">
              {teams
                .sort((a, b) => (b.performance || 0) - (a.performance || 0))
                .slice(0, 3)
                .map(team => (
                  <div key={team.id} className="p-3 bg-zinc-700 rounded">
                    <p className="text-sm font-semibold text-white">
                      {team.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {team.performance}% performance • {team.players} players
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Trends */}
          <div
            className="bg-zinc-800 p-6 rounded"
            style={{ background: '#181818' }}
          >
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Recent Trends
            </h3>
            <div className="space-y-3">
              {metrics
                .filter(m => m.changeType === 'increase')
                .slice(0, 3)
                .map(metric => (
                  <div key={metric.id} className="p-3 bg-zinc-700 rounded">
                    <p className="text-sm font-semibold text-white">
                      {metric.name}
                    </p>
                    <p className="text-xs text-green-400">
                      +{metric.change}% improvement
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
