'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Users,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import UniversalCard from '@/components/ui/UniversalCard';
import { z } from 'zod';

// Zod schemas for validation
const ChildSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  team: z.string(),
  position: z.string(),
  status: z.enum(['active', 'inactive']),
  lastSession: z.string(),
  nextSession: z.string(),
});

const ChildProgressSchema = z.object({
  id: z.string(),
  childId: z.string(),
  skill: z.string(),
  currentLevel: z.number(),
  targetLevel: z.number(),
  improvement: z.number(),
  lastUpdated: z.string(),
  category: z.enum(['shooting', 'dribbling', 'defense', 'passing', 'fitness']),
});

const ChildSessionSchema = z.object({
  id: z.string(),
  childId: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  type: z.enum(['practice', 'game', 'training', 'recovery']),
  duration: z.number(),
  coach: z.string(),
  status: z.enum(['upcoming', 'completed', 'missed']),
  notes: z.string().optional(),
});

const CommunicationSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  message: z.string(),
  date: z.string(),
  status: z.enum(['unread', 'read', 'replied']),
  type: z.enum(['coach', 'admin', 'system']),
});

// Types for parent portal
interface Child {
  id: string;
  name: string;
  age: number;
  team: string;
  position: string;
  status: 'active' | 'inactive';
  lastSession: string;
  nextSession: string;
}

interface ChildProgress {
  id: string;
  childId: string;
  skill: string;
  currentLevel: number;
  targetLevel: number;
  improvement: number;
  lastUpdated: string;
  category: 'shooting' | 'dribbling' | 'defense' | 'passing' | 'fitness';
}

interface ChildSession {
  id: string;
  childId: string;
  title: string;
  date: string;
  time: string;
  type: 'practice' | 'game' | 'training' | 'recovery';
  duration: number;
  coach: string;
  status: 'upcoming' | 'completed' | 'missed';
  notes?: string;
}

interface Communication {
  id: string;
  from: string;
  to: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
  type: 'coach' | 'admin' | 'system';
}

// Role-specific content for parent portal
const getParentPortalContent = () => {
  return {
    title: 'Parent Portal',
    description:
      "Monitor your children's progress and stay connected with coaches",
    children: [
      {
        id: '1',
        name: 'Alex Johnson',
        age: 14,
        team: 'Varsity Boys',
        position: 'Point Guard',
        status: 'active' as const,
        lastSession: '2024-01-18',
        nextSession: '2024-01-22',
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        age: 12,
        team: 'JV Girls',
        position: 'Shooting Guard',
        status: 'active' as const,
        lastSession: '2024-01-17',
        nextSession: '2024-01-21',
      },
    ],
    progress: [
      {
        id: '1',
        childId: '1',
        skill: '3-Point Shooting',
        currentLevel: 7,
        targetLevel: 9,
        improvement: 15,
        lastUpdated: '2024-01-15',
        category: 'shooting' as const,
      },
      {
        id: '2',
        childId: '1',
        skill: 'Ball Handling',
        currentLevel: 8,
        targetLevel: 9,
        improvement: 8,
        lastUpdated: '2024-01-14',
        category: 'dribbling' as const,
      },
      {
        id: '3',
        childId: '2',
        skill: 'Defensive Positioning',
        currentLevel: 6,
        targetLevel: 8,
        improvement: 12,
        lastUpdated: '2024-01-13',
        category: 'defense' as const,
      },
    ],
    sessions: [
      {
        id: '1',
        childId: '1',
        title: 'Shooting Practice',
        date: '2024-01-22',
        time: '3:00 PM',
        type: 'practice' as const,
        duration: 90,
        coach: 'Coach Johnson',
        status: 'upcoming' as const,
        notes: 'Focus on 3-point accuracy',
      },
      {
        id: '2',
        childId: '2',
        title: 'Team Scrimmage',
        date: '2024-01-21',
        time: '4:30 PM',
        type: 'game' as const,
        duration: 120,
        coach: 'Coach Smith',
        status: 'upcoming' as const,
        notes: 'Home game vs. Central High',
      },
      {
        id: '3',
        childId: '1',
        title: 'Team Practice',
        date: '2024-01-18',
        time: '4:00 PM',
        type: 'practice' as const,
        duration: 90,
        coach: 'Coach Johnson',
        status: 'completed' as const,
        notes: 'Good defensive effort',
      },
    ],
    communications: [
      {
        id: '1',
        from: 'Coach Johnson',
        to: 'Parent',
        subject: "Alex's Progress Update",
        message:
          'Alex has shown great improvement in his shooting accuracy this month. Keep up the good work!',
        date: '2024-01-15',
        status: 'read' as const,
        type: 'coach' as const,
      },
      {
        id: '2',
        from: 'Coach Smith',
        to: 'Parent',
        subject: "Sarah's Team Assignment",
        message:
          "Sarah has been moved to the starting lineup for this week's game. Congratulations!",
        date: '2024-01-14',
        status: 'unread' as const,
        type: 'coach' as const,
      },
      {
        id: '3',
        from: 'System',
        to: 'Parent',
        subject: 'Monthly Progress Report Available',
        message:
          "Your children's monthly progress reports are now available for review.",
        date: '2024-01-10',
        status: 'read' as const,
        type: 'system' as const,
      },
    ],
  };
};

// Main component
export default function ParentPortalPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [progress, setProgress] = useState<ChildProgress[]>([]);
  const [sessions, setSessions] = useState<ChildSession[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childFilter, setChildFilter] = useState('all');
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);

  const parentContent = getParentPortalContent();

  const filteredChildren = children.filter(child => {
    return childFilter === 'all' || child.id === childFilter;
  });

  const filteredProgress = progress.filter(p => {
    return selectedChildId === null || p.childId === selectedChildId;
  });

  const filteredSessions = sessions.filter(s => {
    return selectedChildId === null || s.childId === selectedChildId;
  });

  // Handle child selection
  const handleChildSelect = (childId: string) => {
    if (selectedChildId === childId) {
      setSelectedChildId(null);
    } else {
      setSelectedChildId(childId);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set parent portal data
        setChildren(parentContent.children);
        setProgress(parentContent.progress);
        setSessions(parentContent.sessions);
        setCommunications(parentContent.communications);

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch parent data'
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Removed parentContent from dependencies to prevent infinite loop

  if (loading) {
    return (
      <DashboardLayout
        left={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Parent Portal</h2>
            </div>
          </div>
        }
        center={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading parent portal...</p>
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
              <Users size={20} />
              My Children
            </h2>
            <div className="relative">
              <button
                onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded text-sm hover:bg-zinc-700 transition-colors"
              >
                <Filter size={16} />
                {childFilter === 'all'
                  ? 'All'
                  : children.find(c => c.id === childFilter)?.name || 'All'}
                {isChildDropdownOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {isChildDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded shadow-lg z-10 min-w-[150px]">
                  <button
                    onClick={() => {
                      setChildFilter('all');
                      setIsChildDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors"
                  >
                    All Children
                  </button>
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setChildFilter(child.id);
                        setIsChildDropdownOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {filteredChildren.map(child => (
              <div
                key={child.id}
                onClick={() => handleChildSelect(child.id)}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedChildId === child.id
                    ? 'border-[#d8cc97] bg-zinc-800'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-white">{child.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      child.status === 'active'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {child.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-zinc-400">
                  <p>
                    Age: {child.age} • {child.position}
                  </p>
                  <p>Team: {child.team}</p>
                  <p>Last session: {child.lastSession}</p>
                  <p>Next session: {child.nextSession}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      center={
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Progress Overview
          </h2>

          <div className="space-y-4">
            {filteredProgress.map(skill => {
              const child = children.find(c => c.id === skill.childId);
              return (
                <UniversalCard.Default
                  key={skill.id}
                  title={skill.skill}
                  subtitle={child?.name || ''}
                  size="lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {skill.skill}
                      </h3>
                      <p className="text-sm text-zinc-400">{child?.name}</p>
                    </div>
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
              );
            })}
          </div>

          <UniversalCard.Default title="Recent Achievements" size="sm">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#d8cc97] rounded-full"></div>
                <span className="text-zinc-300">
                  Alex improved shooting by 15%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#d8cc97] rounded-full"></div>
                <span className="text-zinc-300">
                  Sarah moved to starting lineup
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                <span className="text-zinc-500">
                  Both children completed 50 sessions
                </span>
              </div>
            </div>
          </UniversalCard.Default>
        </div>
      }
      right={
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            Communications
          </h2>

          <div className="space-y-3">
            {communications.map(comm => (
              <UniversalCard.Default
                key={comm.id}
                title={comm.subject}
                subtitle={`From: ${comm.from}`}
                size="lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">{comm.subject}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      comm.status === 'unread'
                        ? 'bg-blue-900 text-blue-300'
                        : comm.status === 'replied'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {comm.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-zinc-400">
                  <p>From: {comm.from}</p>
                  <p>Date: {comm.date}</p>
                  <p className="text-zinc-300 mt-2">{comm.message}</p>
                </div>
              </UniversalCard.Default>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-[#d8cc97] mb-3">
              Upcoming Sessions
            </h3>
            <div className="space-y-2">
              {filteredSessions
                .filter(session => session.status === 'upcoming')
                .slice(0, 3)
                .map(session => {
                  const child = children.find(c => c.id === session.childId);
                  return (
                    <div
                      key={session.id}
                      className="flex justify-between items-center p-2 bg-zinc-800 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {session.title}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {child?.name} • {session.date}
                        </p>
                      </div>
                      <span
                        className={`text-xs ${
                          session.type === 'game'
                            ? 'text-red-300'
                            : 'text-blue-300'
                        }`}
                      >
                        {session.type}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      }
    />
  );
}
