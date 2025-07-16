'use client';
import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
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
    <DashboardLayout
      left={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Simulation Test</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Current Role</h3>
              <div className="flex items-center space-x-2 mb-2">
                {getRoleIcon(simulatedRole)}
                <span className="font-medium capitalize">{simulatedRole}</span>
              </div>
              <p className="text-sm text-gray-600">
                {getRoleDescription(simulatedRole)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Role Selection</h3>
              <div className="space-y-2">
                {['superadmin', 'admin', 'coach', 'player', 'parent'].map(
                  role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        simulatedRole === role
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role)}
                        <span className="capitalize">{role}</span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      }
      center={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Simulation Test Page</h1>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Simulation Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Role
                </label>
                <p className="text-gray-900 capitalize">{simulatedRole}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation Active
                </label>
                <p className="text-gray-900">{isSimulating ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-gray-900">{userId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-gray-900 capitalize">{role}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Enabled Features</h3>
            <div className="space-y-2">
              {Object.entries(enabledFeatures).map(([feature, enabled]) => (
                <div
                  key={feature}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{feature}</span>
                  <button
                    onClick={() => handleFeatureToggle(feature)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setDevToolsOpen(!devToolsOpen)}
                className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
              >
                Toggle Dev Tools
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Reset Simulation
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">Current User</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{mockCurrentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{mockCurrentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">
                  {mockCurrentUser.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
