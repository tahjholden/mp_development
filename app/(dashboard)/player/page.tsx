'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Trophy,
  Target,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { z } from 'zod';

// Zod schemas for validation
const PlayerGoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  target: z.number(),
  current: z.number(),
  unit: z.string(),
  deadline: z.string(),
  status: z.enum(['on_track', 'behind', 'completed']),
  category: z.enum(['skill', 'fitness', 'mental', 'team']),
});
const PlayerGoalsArraySchema = z.array(PlayerGoalSchema);

const PlayerSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  type: z.enum(['practice', 'game', 'training', 'recovery']),
  duration: z.number(),
  coach: z.string(),
  status: z.enum(['upcoming', 'completed', 'missed']),
  notes: z.string().optional(),
});
const PlayerSessionsArraySchema = z.array(PlayerSessionSchema);

const PlayerProgressSchema = z.object({
  id: z.string(),
  skill: z.string(),
  currentLevel: z.number(),
  targetLevel: z.number(),
  improvement: z.number(),
  lastUpdated: z.string(),
  category: z.enum(['shooting', 'dribbling', 'defense', 'passing', 'fitness']),
});
const PlayerProgressArraySchema = z.array(PlayerProgressSchema);

// Types for player portal
interface PlayerGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'on_track' | 'behind' | 'completed';
  category: 'skill' | 'fitness' | 'mental' | 'team';
}

interface PlayerSession {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'practice' | 'game' | 'training' | 'recovery';
  duration: number;
  coach: string;
  status: 'upcoming' | 'completed' | 'missed';
  notes?: string;
}

interface PlayerProgress {
  id: string;
  skill: string;
  currentLevel: number;
  targetLevel: number;
  improvement: number;
  lastUpdated: string;
  category: 'shooting' | 'dribbling' | 'defense' | 'passing' | 'fitness';
}

// Role-specific content for player portal
const getPlayerPortalContent = () => {
  return {
    title: 'Player Portal',
    description: 'Track your progress, goals, and development journey',
    goals: [
      {
        id: '1',
        title: 'Improve Free Throw Percentage',
        description: 'Increase accuracy from 3-point line',
        target: 85,
        current: 72,
        unit: '%',
        deadline: '2024-03-15',
        status: 'on_track' as const,
        category: 'skill' as const,
      },
      {
        id: '2',
        title: 'Increase Vertical Jump',
        description: 'Improve explosive power for rebounds',
        target: 28,
        current: 24,
        unit: 'inches',
        deadline: '2024-04-01',
        status: 'behind' as const,
        category: 'fitness' as const,
      },
      {
        id: '3',
        title: 'Complete 100 Practice Sessions',
        description: 'Consistent training commitment',
        target: 100,
        current: 67,
        unit: 'sessions',
        deadline: '2024-06-30',
        status: 'on_track' as const,
        category: 'team' as const,
      },
    ],
    sessions: [
      {
        id: '1',
        title: 'Shooting Practice',
        date: '2024-01-20',
        time: '3:00 PM',
        type: 'practice' as const,
        duration: 90,
        coach: 'Coach Johnson',
        status: 'upcoming' as const,
        notes: 'Focus on 3-point accuracy',
      },
      {
        id: '2',
        title: 'Team Scrimmage',
        date: '2024-01-18',
        time: '4:30 PM',
        type: 'game' as const,
        duration: 120,
        coach: 'Coach Smith',
        status: 'completed' as const,
        notes: 'Good defensive effort',
      },
      {
        id: '3',
        title: 'Strength Training',
        date: '2024-01-16',
        time: '2:00 PM',
        type: 'training' as const,
        duration: 60,
        coach: 'Coach Wilson',
        status: 'completed' as const,
      },
    ],
    progress: [
      {
        id: '1',
        skill: '3-Point Shooting',
        currentLevel: 7,
        targetLevel: 9,
        improvement: 15,
        lastUpdated: '2024-01-15',
        category: 'shooting' as const,
      },
      {
        id: '2',
        skill: 'Ball Handling',
        currentLevel: 8,
        targetLevel: 9,
        improvement: 8,
        lastUpdated: '2024-01-14',
        category: 'dribbling' as const,
      },
      {
        id: '3',
        skill: 'Defensive Positioning',
        currentLevel: 6,
        targetLevel: 8,
        improvement: 12,
        lastUpdated: '2024-01-13',
        category: 'defense' as const,
      },
    ],
  };
};

// Main component
export default function PlayerPortalPage() {
  const [goals, setGoals] = useState<PlayerGoal[]>([]);
  const [sessions, setSessions] = useState<PlayerSession[]>([]);
  const [progress, setProgress] = useState<PlayerProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalCategoryFilter, setGoalCategoryFilter] = useState('all');
  const [isGoalCategoryDropdownOpen, setIsGoalCategoryDropdownOpen] =
    useState(false);

  const playerContent = getPlayerPortalContent();

  const filteredGoals = goals.filter(goal => {
    return goalCategoryFilter === 'all' || goal.category === goalCategoryFilter;
  });

  // Handle goal selection
  const handleGoalSelect = (goalId: string) => {
    if (selectedGoalId === goalId) {
      setSelectedGoalId(null);
    } else {
      setSelectedGoalId(goalId);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set player portal data
        setGoals(playerContent.goals);
        setSessions(playerContent.sessions);
        setProgress(playerContent.progress);

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch player data'
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Removed playerContent from dependencies to prevent infinite loop

  if (loading) {
    return (
      <DashboardLayout
        left={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Player Portal</h2>
            </div>
          </div>
        }
        center={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading player portal...</p>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            {/* TODO: Port your right sidebar content here */}
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <DashboardLayout
        left={<div className="space-y-4"></div>}
        center={
          <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
              {error}
            </div>
          </div>
        }
        right={<div className="space-y-4"></div>}
      />
    );
  }

  return (
    <DashboardLayout
      left={
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#d8cc97] flex items-center gap-2">
              <Target size={20} />
              My Goals
            </h2>
            <div className="relative">
              <button
                onClick={() =>
                  setIsGoalCategoryDropdownOpen(!isGoalCategoryDropdownOpen)
                }
                className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded text-sm hover:bg-zinc-700 transition-colors"
              >
                <Filter size={16} />
                {goalCategoryFilter === 'all' ? 'All' : goalCategoryFilter}
                {isGoalCategoryDropdownOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {isGoalCategoryDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded shadow-lg z-10 min-w-[120px]">
                  {['all', 'skill', 'fitness', 'mental', 'team'].map(
                    category => (
                      <button
                        key={category}
                        onClick={() => {
                          setGoalCategoryFilter(category);
                          setIsGoalCategoryDropdownOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors capitalize"
                      >
                        {category}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {filteredGoals.map(goal => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedGoalId === goal.id
                      ? 'border-[#d8cc97] bg-zinc-800'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{goal.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        goal.status === 'completed'
                          ? 'bg-green-900 text-green-300'
                          : goal.status === 'on_track'
                            ? 'bg-blue-900 text-blue-300'
                            : 'bg-yellow-900 text-yellow-300'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 mb-3">
                    {goal.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Progress</span>
                      <span className="text-white">
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-[#d8cc97] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Deadline: {goal.deadline}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      center={
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Upcoming Sessions
          </h2>

          <div className="space-y-3">
            {sessions
              .filter(session => session.status === 'upcoming')
              .map(session => (
                <UniversalCard.Default
                  key={session.id}
                  title={session.title}
                  subtitle={`${session.date} at ${session.time}`}
                  size="lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">
                        {session.title}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {session.date} at {session.time}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        session.type === 'game'
                          ? 'bg-red-900 text-red-300'
                          : session.type === 'practice'
                            ? 'bg-blue-900 text-blue-300'
                            : 'bg-green-900 text-green-300'
                      }`}
                    >
                      {session.type}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-zinc-400">
                    <p>Duration: {session.duration} minutes</p>
                    <p>Coach: {session.coach}</p>
                    {session.notes && (
                      <p className="text-zinc-300 italic">"{session.notes}"</p>
                    )}
                  </div>
                </UniversalCard.Default>
              ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-[#d8cc97] mb-3">
              Recent Sessions
            </h3>
            <div className="space-y-2">
              {sessions
                .filter(session => session.status === 'completed')
                .slice(0, 3)
                .map(session => (
                  <div
                    key={session.id}
                    className="flex justify-between items-center p-2 bg-zinc-800 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {session.title}
                      </p>
                      <p className="text-xs text-zinc-400">{session.date}</p>
                    </div>
                    <span className="text-xs text-green-300">Completed</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      }
      right={
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Skill Progress
          </h2>

          <div className="space-y-4">
            {progress.map(skill => (
              <UniversalCard.Default
                key={skill.id}
                title={skill.skill}
                subtitle={`Level ${skill.currentLevel}/${skill.targetLevel}`}
                size="lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white">{skill.skill}</h3>
                  <div className="text-right">
                    <p className="text-[#d8cc97] font-bold">
                      Level {skill.currentLevel}/{skill.targetLevel}
                    </p>
                    <p className="text-xs text-green-300">
                      +{skill.improvement}% this month
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Progress</span>
                    <span className="text-white">
                      {Math.round(
                        (skill.currentLevel / skill.targetLevel) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-[#d8cc97] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(skill.currentLevel / skill.targetLevel) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Last updated: {skill.lastUpdated}
                  </p>
                </div>
              </UniversalCard.Default>
            ))}
          </div>

          <UniversalCard.Default title="Achievements" size="sm">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#d8cc97] rounded-full"></div>
                <span className="text-zinc-300">
                  Completed 50 practice sessions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#d8cc97] rounded-full"></div>
                <span className="text-zinc-300">
                  Improved shooting accuracy by 15%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                <span className="text-zinc-500">
                  Reach Level 9 in Ball Handling
                </span>
              </div>
            </div>
          </UniversalCard.Default>
        </div>
      }
    />
  );
}
