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
import { Sidebar } from '@/components/ui/Sidebar';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';

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
  const [user, setUser] = useState<any>(null);

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

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

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
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-64 bg-zinc-800 rounded"></div>
              <div className="h-64 bg-zinc-800 rounded"></div>
              <div className="h-64 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#d8cc97] mb-2">
            {playerContent.title}
          </h1>
          <p className="text-zinc-400">{playerContent.description}</p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Goals */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
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

          {/* Center Column - Sessions */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Upcoming Sessions
            </h2>

            <div className="space-y-3">
              {sessions
                .filter(session => session.status === 'upcoming')
                .map(session => (
                  <div
                    key={session.id}
                    className="border border-zinc-700 rounded p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">
                        {session.title}
                      </h3>
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
                      <p>
                        {session.date} at {session.time}
                      </p>
                      <p>Duration: {session.duration} minutes</p>
                      <p>Coach: {session.coach}</p>
                      {session.notes && (
                        <p className="text-zinc-300 italic">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>
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

          {/* Right Column - Progress */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Skill Progress
            </h2>

            <div className="space-y-4">
              {progress.map(skill => (
                <div
                  key={skill.id}
                  className="border border-zinc-700 rounded p-4"
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
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-zinc-800 rounded">
              <h3 className="text-lg font-medium text-[#d8cc97] mb-2 flex items-center gap-2">
                <Trophy size={18} />
                Achievements
              </h3>
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
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay - Hidden for superadmin */}
      {user?.personType !== 'superadmin' && (
        <ComingSoonOverlay
          title="Player Portal Features Coming Soon!"
          description="We're building an advanced player portal with personalized training plans, AI-powered insights, and real-time progress tracking. Stay tuned for enhanced player development tools."
        />
      )}
    </div>
  );
}
