'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  Users,
  Building,
  Users2,
  AlertTriangle,
  X,
  Eye,
  Play,
  Square,
} from 'lucide-react';
import { useSimulation } from '@/lib/contexts/SimulationContext';
import { UnifiedUser } from '@/lib/db/user-service';
import SimulateUserPanel from './SimulateUserPanel';

interface DevToolsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    isSuperadmin: boolean;
  };
  onRoleChange: (role: string) => void;
  onFeatureToggle: (feature: string, enabled: boolean) => void;
}

const roles = [
  {
    id: 'superadmin',
    name: 'Superadmin',
    description: 'Full system access and control',
    icon: Shield,
  },
  {
    id: 'admin',
    name: 'Team Admin',
    description: 'Team management and settings',
    icon: Building,
  },
  {
    id: 'coach',
    name: 'Coach',
    description: 'Player development and training',
    icon: UserCheck,
  },
  {
    id: 'player',
    name: 'Player',
    description: 'Personal development and progress',
    icon: Users,
  },
  {
    id: 'parent',
    name: 'Parent',
    description: 'Monitor child progress and communication',
    icon: Users2,
  },
];

const features = [
  {
    id: 'billing',
    name: 'Billing & Subscriptions',
    description: 'Payment processing and plan management',
  },
  {
    id: 'playerPortal',
    name: 'Player Portal',
    description: 'Player-specific features and views',
  },
  {
    id: 'parentPortal',
    name: 'Parent Portal',
    description: 'Parent communication and monitoring',
  },
  {
    id: 'advancedAnalytics',
    name: 'Advanced Analytics',
    description: 'Detailed performance insights',
  },
  {
    id: 'aiFeatures',
    name: 'AI Features',
    description: 'AI-powered recommendations and insights',
  },
  {
    id: 'auditLogs',
    name: 'Audit Logs',
    description: 'System activity and security logs',
  },
];

export default function DevTools({
  isOpen,
  onClose,
  currentUser,
  onRoleChange,
  onFeatureToggle,
}: DevToolsProps) {
  const {
    simulatedRole,
    enabledFeatures,
    isSimulating,
    simulatedUser,
    availableUsers,
    setSimulatedRole,
    toggleFeature,
    startSimulation,
    stopSimulation,
    setAvailableUsers,
  } = useSimulation();

  const [showImpersonationWarning, setShowImpersonationWarning] =
    useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<string>('');
  const [showSimulateUserPanel, setShowSimulateUserPanel] = useState(false);

  // Fetch available users for simulation
  useEffect(() => {
    if (isOpen && currentUser.isSuperadmin) {
      fetchAvailableUsers();
    }
  }, [isOpen, currentUser.isSuperadmin]);

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/dev/users');
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users);
      } else {
        console.error('Failed to fetch users for simulation');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartSimulation = (user: UnifiedUser) => {
    // Start simulation directly
    startSimulation(user);
  };

  const confirmSimulation = () => {
    if (simulatedUser) {
      startSimulation(simulatedUser);
      setShowImpersonationWarning(false);
    }
  };

  const handleStopSimulation = () => {
    stopSimulation();
  };

  const filteredUsers = selectedUserRole
    ? availableUsers.filter(user => user.primaryRole === selectedUserRole)
    : availableUsers;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dev Tools - Simulation Mode
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Left Panel - Visual Simulation */}
            <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Visual Simulation
              </h3>

              {/* Role Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Simulate Role
                </h4>
                <div className="space-y-2">
                  {roles.map(role => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setSimulatedRole(role.id);
                          onRoleChange(role.id);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          simulatedRole === role.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {role.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feature Flags */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Feature Flags
                </h4>
                <div className="space-y-2">
                  {features.map(feature => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {feature.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          toggleFeature(feature.id);
                          onFeatureToggle(
                            feature.id,
                            !enabledFeatures[feature.id]
                          );
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enabledFeatures[feature.id]
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enabledFeatures[feature.id]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Functional Simulation */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Functional Simulation
              </h3>

              {/* Current Simulation Status */}
              <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Current Status
                </h4>
                {isSimulating ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Simulating as{' '}
                        {simulatedUser?.displayName || simulatedUser?.email}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Role: {simulatedUser?.primaryRole}
                    </div>
                    <button
                      onClick={handleStopSimulation}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop Simulation</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Square className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      No active simulation
                    </span>
                  </div>
                )}
              </div>

              {/* User Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Impersonate User
                </h4>

                {/* Role Filter */}
                <div className="mb-3">
                  <select
                    value={selectedUserRole}
                    onChange={e => setSelectedUserRole(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Roles</option>
                    <option value="player">Players</option>
                    <option value="coach">Coaches</option>
                    <option value="parent">Parents</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {/* User List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loadingUsers ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Loading users...
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.displayName ||
                              `${user.firstName} ${user.lastName}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {user.primaryRole} • {user.organizationName}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartSimulation(user)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Simulate</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No users found
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSimulatedRole('player')}
                    className="p-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Switch to Player
                  </button>
                  <button
                    onClick={() => setSimulatedRole('coach')}
                    className="p-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Switch to Coach
                  </button>
                  <button
                    onClick={() => setShowSimulateUserPanel(true)}
                    className="p-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Open User Panel
                  </button>
                  <button
                    onClick={() => setSimulatedRole('parent')}
                    className="p-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Switch to Parent
                  </button>
                  <button
                    onClick={() => setSimulatedRole('admin')}
                    className="p-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Switch to Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impersonation Warning Modal */}
      {showImpersonationWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Start Simulation?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You're about to simulate as{' '}
              <strong>
                {simulatedUser?.displayName || simulatedUser?.email}
              </strong>
              . All actions will be performed as this user while maintaining
              your superadmin session.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowImpersonationWarning(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmSimulation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Start Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SimulateUserPanel */}
      <SimulateUserPanel
        isOpen={showSimulateUserPanel}
        onClose={() => setShowSimulateUserPanel(false)}
      />
    </>
  );
}
