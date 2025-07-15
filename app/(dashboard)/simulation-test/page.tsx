'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import {
  useSimulation,
  useSimulatedUser,
} from '@/lib/contexts/SimulationContext';
import DevTools from '@/components/ui/DevTools';
import { Shield, User, UserCheck, Users, Building } from 'lucide-react';

export default function SimulationTestPage() {
  const {
    simulatedRole,
    enabledFeatures,
    isSimulating,
    simulatedUser,
    devToolsOpen,
    setDevToolsOpen,
    setSimulatedRole,
    toggleFeature,
  } = useSimulation();

  const { userId, role } = useSimulatedUser();

  const handleRoleChange = (role: string) => {
    setSimulatedRole(role);
  };

  const handleFeatureToggle = (feature: string) => {
    toggleFeature(feature);
  };

  // Mock current user for sidebar
  const mockCurrentUser = {
    id: 'current-user-id',
    name: 'Tahj Holden',
    email: 'tahjholden@gmail.com',
    role: 'superadmin',
    isSuperadmin: true,
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="h-6 w-6 text-red-500" />;
      case 'admin':
        return <Building className="h-6 w-6 text-blue-500" />;
      case 'coach':
        return <UserCheck className="h-6 w-6 text-green-500" />;
      case 'player':
        return <User className="h-6 w-6 text-purple-500" />;
      case 'parent':
        return <Users className="h-6 w-6 text-orange-500" />;
      default:
        return <User className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Full system access and control';
      case 'admin':
        return 'Team management and settings';
      case 'coach':
        return 'Player development and training';
      case 'player':
        return 'Personal development and progress';
      case 'parent':
        return 'Monitor child progress and communication';
      default:
        return 'Unknown role';
    }
  };

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between">
        <span
          className="text-2xl font-bold tracking-wide text-[#d8cc97]"
          style={{ letterSpacing: '0.04em' }}
        >
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">
            {mockCurrentUser.name}
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            {mockCurrentUser.email}
          </span>
          <span className="text-xs text-white leading-tight capitalize">
            {mockCurrentUser.role}
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar user={mockCurrentUser} onSignOut={() => {}} />

      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen">
        {/* LEFT COLUMN: Current Simulation Status */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Simulation Status
          </h2>
          <div className="space-y-6">
            {/* Visual Simulation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Visual Simulation
              </h3>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                {getRoleIcon(simulatedRole)}
                <div>
                  <div className="font-medium text-white">
                    {simulatedRole.charAt(0).toUpperCase() +
                      simulatedRole.slice(1)}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {getRoleDescription(simulatedRole)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-400">
                  Enabled Features:
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(enabledFeatures)
                    .filter(([, enabled]) => enabled)
                    .map(([feature]) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs rounded bg-zinc-800 text-white border border-[#d8cc97]"
                      >
                        {feature}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Functional Simulation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Functional Simulation
              </h3>
              {isSimulating && simulatedUser ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium text-green-200">
                        Active Simulation
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-400">
                        Simulating as:
                      </div>
                      <div className="mt-1 p-3 bg-zinc-800 rounded-lg">
                        <div className="font-medium text-white">
                          {simulatedUser.displayName ||
                            `${simulatedUser.firstName} ${simulatedUser.lastName}`}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {simulatedUser.email}
                        </div>
                        <div className="text-xs mt-1 text-zinc-500">
                          ID: {simulatedUser.id}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-400">
                        Effective User Context:
                      </div>
                      <div className="mt-1 text-sm text-zinc-400">
                        <div>Role: {simulatedUser.primaryRole}</div>
                        <div>
                          Organization: {simulatedUser.organizationName}
                        </div>
                        <div>Admin: {simulatedUser.isAdmin ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <div className="text-sm text-zinc-400">
                    No active functional simulation
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Role-Based Content Preview */}
        <div className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen space-y-8">
          {/* Role-Based Content Preview */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#d8cc97]">
              Role-Based Content Preview
            </h2>

            {simulatedRole === 'coach' && (
              <div className="space-y-4">
                <h4 className="font-medium text-white">Coach Dashboard</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                    <div className="font-medium text-white">
                      Player Management
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      View and manage your players
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                    <div className="font-medium text-white">
                      Development Plans
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Create and track player development
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                    <div className="font-medium text-white">Observations</div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Log and review player observations
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                    <div className="font-medium text-white">Team Schedule</div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Manage practice and game schedules
                    </div>
                  </div>
                </div>
              </div>
            )}

            {simulatedRole === 'admin' && (
              <div className="space-y-4">
                <h4 className="font-medium text-white">Admin Dashboard</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-800 border border-green-500">
                    <div className="font-medium text-green-400">
                      Team Settings
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Manage team configuration and permissions
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-[#d8cc97]">
                    <div className="font-medium text-[#d8cc97]">
                      User Management
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Add, remove, and manage team members
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-red-500">
                    <div className="font-medium text-red-400">
                      Billing & Subscriptions
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Manage team subscriptions and payments
                    </div>
                  </div>
                </div>
              </div>
            )}

            {simulatedRole === 'superadmin' && (
              <div className="space-y-4">
                <h4 className="font-medium text-white">Superadmin Dashboard</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-800 border border-red-500">
                    <div className="font-medium text-red-400">
                      System Administration
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Full system access and control
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-[#d8cc97]">
                    <div className="font-medium text-[#d8cc97]">Dev Tools</div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Access to development and testing tools
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-500">
                    <div className="font-medium text-white">All Features</div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Access to all platform features and data
                    </div>
                  </div>
                </div>
              </div>
            )}

            {simulatedRole === 'player' && (
              <div className="space-y-4">
                <h4 className="font-medium text-white">Player Portal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-800 border border-purple-500">
                    <div className="font-medium text-purple-400">
                      My Development Plan
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      View your personal development plan
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-purple-500">
                    <div className="font-medium text-purple-400">
                      My Progress
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Track your development progress
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-purple-500">
                    <div className="font-medium text-purple-400">
                      My Schedule
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      View your practice and game schedule
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-purple-500">
                    <div className="font-medium text-purple-400">
                      My Journal
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Log your personal notes and reflections
                    </div>
                  </div>
                </div>
              </div>
            )}

            {simulatedRole === 'parent' && (
              <div className="space-y-4">
                <h4 className="font-medium text-white">Parent Portal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-800 border border-orange-500">
                    <div className="font-medium text-orange-400">
                      Child Progress
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Monitor your child's development progress
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-orange-500">
                    <div className="font-medium text-orange-400">
                      Communication
                    </div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Communicate with coaches and staff
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-orange-500">
                    <div className="font-medium text-orange-400">Schedule</div>
                    <div className="text-sm mt-1 text-zinc-400">
                      View your child's schedule
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-800 border border-orange-500">
                    <div className="font-medium text-orange-400">Payments</div>
                    <div className="text-sm mt-1 text-zinc-400">
                      Manage payments and subscriptions
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: API Context Information */}
        <div className="w-1/4 p-6 bg-black flex flex-col justify-start min-h-screen">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            API Context
          </h2>
          <div className="space-y-6">
            <div className="text-sm text-zinc-400">
              This shows how API calls would be made with the current simulation
              context:
            </div>
            <div className="rounded-lg p-4 font-mono text-sm bg-zinc-800 border border-zinc-700">
              <div className="space-y-2">
                <div>
                  <span className="text-zinc-400">Effective User ID:</span>{' '}
                  <span className="text-green-400">{userId || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Effective Role:</span>{' '}
                  <span className="text-[#d8cc97]">{role}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Simulation Mode:</span>{' '}
                  <span className="text-blue-400">
                    {isSimulating ? 'Functional' : 'Visual'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">API Context:</span>{' '}
                  <span className="text-yellow-400">
                    {isSimulating
                      ? `All requests use user ID: ${userId}`
                      : 'Requests use actual authenticated user'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 border-l-4 border-[#d8cc97] rounded-lg p-4 space-y-3 shadow-md">
              <div className="flex items-center gap-2 font-bold text-lg">
                <span className="text-[#d8cc97]">🔧 Quick Actions</span>
              </div>
              <div className="grid gap-2">
                <button
                  onClick={() => handleRoleChange('coach')}
                  className="text-left p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors"
                >
                  Switch to Coach Role
                </button>
                <button
                  onClick={() => handleRoleChange('admin')}
                  className="text-left p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors"
                >
                  Switch to Admin Role
                </button>
                <button
                  onClick={() => handleRoleChange('player')}
                  className="text-left p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors"
                >
                  Switch to Player Role
                </button>
                <button
                  onClick={() => handleRoleChange('parent')}
                  className="text-left p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors"
                >
                  Switch to Parent Role
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Tools Modal */}
      <DevTools
        isOpen={devToolsOpen}
        onClose={() => setDevToolsOpen(false)}
        currentUser={mockCurrentUser}
        onRoleChange={handleRoleChange}
        onFeatureToggle={handleFeatureToggle}
      />
    </div>
  );
}
