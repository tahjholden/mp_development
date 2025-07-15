'use client';

import React, { useState, useEffect } from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import {
  User,
  Calendar,
  Target,
  BarChart3,
  BookOpen,
  Users,
} from 'lucide-react';

interface UserData {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface ParentPortalDashboardProps {
  user: UserData;
}

interface ChildData {
  id: string;
  name: string;
  team: string;
  age: number;
  lastSession: string;
  developmentPlan: string;
  progress: number;
}

export default function ParentPortalDashboard({
  user,
}: ParentPortalDashboardProps) {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);

  // Mock data for development purposes
  useEffect(() => {
    const mockChildren: ChildData[] = [
      {
        id: '1',
        name: 'Alex Johnson',
        team: 'Varsity Boys',
        age: 16,
        lastSession: '2024-01-15',
        developmentPlan: 'Shooting & Ball Handling',
        progress: 75,
      },
      {
        id: '2',
        name: 'Sarah Williams',
        team: 'JV Girls',
        age: 14,
        lastSession: '2024-01-14',
        developmentPlan: 'Defense & Conditioning',
        progress: 60,
      },
      {
        id: '3',
        name: 'Mike Davis',
        team: 'Freshman Boys',
        age: 15,
        lastSession: '2024-01-13',
        developmentPlan: 'Team Play & Communication',
        progress: 85,
      },
    ];

    setTimeout(() => {
      setChildren(mockChildren);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChildSelect = (child: ChildData) => {
    setSelectedChild(child);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading child data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <UniversalCard.Default title="Welcome to Parent Portal">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-600">
              Monitor your child's basketball development and progress
            </p>
          </div>
        </div>
      </UniversalCard.Default>

      {/* Children Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {children.map(child => (
          <UniversalCard.Default
            key={child.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedChild?.id === child.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleChildSelect(child)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{child.name}</h3>
                    <p className="text-sm text-gray-600">{child.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Age {child.age}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span
                    className={`font-semibold ${getProgressColor(child.progress)}`}
                  >
                    {child.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      child.progress >= 80
                        ? 'bg-green-500'
                        : child.progress >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${child.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">
                    Last session:{' '}
                    {new Date(child.lastSession).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">{child.developmentPlan}</span>
                </div>
              </div>
            </div>
          </UniversalCard.Default>
        ))}
      </div>

      {/* Selected Child Details */}
      {selectedChild && (
        <UniversalCard.Default
          title={`${selectedChild.name} - Development Details`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <UniversalButton.Secondary size="sm">
                View Full Report
              </UniversalButton.Secondary>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Current Focus</span>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedChild.developmentPlan}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Recent Activities</span>
                </div>
                <p className="text-sm text-gray-600">
                  Shooting drills, team scrimmages, conditioning
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Next Goals</span>
                </div>
                <p className="text-sm text-gray-600">
                  Improve 3-point accuracy, enhance defensive positioning
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex space-x-4">
                <UniversalButton.Primary>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </UniversalButton.Primary>
                <UniversalButton.Secondary>
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Development Plan
                </UniversalButton.Secondary>
                <UniversalButton.Secondary>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Progress Report
                </UniversalButton.Secondary>
              </div>
            </div>
          </div>
        </UniversalCard.Default>
      )}

      {/* Quick Actions */}
      <UniversalCard.Default title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UniversalButton.Secondary className="h-auto p-4">
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <span className="text-sm">Schedule Parent Meeting</span>
            </div>
          </UniversalButton.Secondary>
          <UniversalButton.Secondary className="h-auto p-4">
            <div className="text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <span className="text-sm">View Academic Progress</span>
            </div>
          </UniversalButton.Secondary>
          <UniversalButton.Secondary className="h-auto p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <span className="text-sm">Performance Analytics</span>
            </div>
          </UniversalButton.Secondary>
          <UniversalButton.Secondary className="h-auto p-4">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <span className="text-sm">Team Communication</span>
            </div>
          </UniversalButton.Secondary>
        </div>
      </UniversalCard.Default>
    </div>
  );
}
