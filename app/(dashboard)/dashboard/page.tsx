'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import UniversalButton from '@/components/ui/UniversalButton';
import {
  Users,
  Award,
  Calendar,
  Activity,
  Shield,
  Database,
  Eye,
  FileText,
  UserPlus,
  BarChart3,
  Settings,
  Plus,
  Download,
  Clipboard,
  AlertTriangle,
  CreditCard,
  Mail,
  UserCheck,
} from 'lucide-react';
import PlayerPortalDashboard from '@/components/basketball/PlayerPortalDashboard';

// Mock user context with roles and feature flags
const createMockUser = (role: string) => {
  const baseUser = {
    id: '1',
    name: role === 'admin' ? 'Admin' : role === 'player' ? 'Player' : 'Coach',
    email: role === 'admin' ? 'admin@example.com' : role === 'player' ? 'player@example.com' : 'coach@example.com',
    role: role,
    orgId: 'org_123',
    teamId: 'team_456',
  };

  // Feature flags based on role
  const features = {
    billing: role === 'admin',
    advancedAnalytics: role === 'admin',
    customBranding: role === 'admin',
    teamFees: role === 'admin',
    userManagement: role === 'admin',
    systemSettings: role === 'admin',
    auditLogs: role === 'admin',
    dataExport: role === 'admin',
    playerPortal: role === 'player',
  };

  return { ...baseUser, features };
};

// Role-aware main component
export default function DashboardPage() {
  const [currentRole, setCurrentRole] = useState<'coach' | 'admin' | 'player'>('coach');
  const [user, setUser] = useState(createMockUser('coach'));

  // Update user when role changes
  useEffect(() => {
    setUser(createMockUser(currentRole));
  }, [currentRole]);

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between">
        <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">
            {user.name}
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            {user.email}
          </span>
          <span className="text-xs text-white leading-tight capitalize">{user.role}</span>
        </div>
      </header>
      
      {/* Sidebar */}
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen">
        {/* LEFT COLUMN: Entity Panel */}
        <EntityPanel user={user} />
        
        {/* CENTER COLUMN: Main Panel */}
        <MainPanel>
          {/* Demo Mode Toggle */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[#d8cc97]">Demo Mode</h2>
            <p className="text-sm text-zinc-400 mb-4">Switch between roles to see different views</p>
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setCurrentRole('coach')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentRole === 'coach'
                    ? 'bg-[#d8cc97] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Coach
              </button>
              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentRole === 'admin'
                    ? 'bg-[#d8cc97] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setCurrentRole('player')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentRole === 'player'
                    ? 'bg-[#d8cc97] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Player
              </button>
            </div>
          </div>
          
          {/* Modular Dashboard Home */}
          <DashboardHome user={user} />
        </MainPanel>
        
        {/* RIGHT COLUMN: Right Panel */}
        <RightPanel>
          <RecentActivity user={user} />
          {/* Admin-only tools */}
          {["admin"].includes(user.role) && <AdminToolsPanel user={user} />}
          {/* Coach quick actions */}
          {["coach"].includes(user.role) && <CoachQuickActions user={user} />}
        </RightPanel>
      </div>
    </div>
  );
}

// Entity Panel - Role-specific stats overview
function EntityPanel({ user }) {
  const coachStats = {
    totalPlayers: 12,
    totalTeams: 3,
    activePlans: 8,
    recentObservations: 15,
  };

  const adminStats = {
    totalUsers: 45,
    totalTeams: 3,
    activePlans: 24,
    totalCoaches: 6,
    pendingInvites: 3,
    systemAlerts: 1,
    dataUsage: '2.4GB',
    lastBackup: '2 hours ago',
    billingStatus: 'active',
    subscriptionTier: 'Pro',
    monthlyCost: 299,
    nextBilling: '2024-02-15',
  };

  return (
    <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen">
      {user.role === 'admin' ? (
        <>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">System Overview</h2>
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{adminStats.totalUsers}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Teams</p>
                <p className="text-2xl font-bold text-white">{adminStats.totalTeams}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Active Plans</p>
                <p className="text-2xl font-bold text-white">{adminStats.activePlans}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <UserCheck className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Coaches</p>
                <p className="text-2xl font-bold text-white">{adminStats.totalCoaches}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">System Alerts</p>
                <p className="text-2xl font-bold text-white">{adminStats.systemAlerts}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">My Stats</h2>
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">My Players</p>
                <p className="text-2xl font-bold text-white">{coachStats.totalPlayers}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">My Teams</p>
                <p className="text-2xl font-bold text-white">{coachStats.totalTeams}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Active Plans</p>
                <p className="text-2xl font-bold text-white">{coachStats.activePlans}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Recent Observations</p>
                <p className="text-2xl font-bold text-white">{coachStats.recentObservations}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Main Panel wrapper
function MainPanel({ children }) {
  return (
    <div className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen space-y-8">
      {children}
    </div>
  );
}

// Right Panel wrapper
function RightPanel({ children }) {
  return (
    <div className="w-1/4 p-6 bg-black flex flex-col justify-start min-h-screen">
      {children}
    </div>
  );
}

// Main Dashboard Home – Modular, Feature-Flag Ready
function DashboardHome({ user }) {
  return (
    <div className="space-y-6">
      {/* Always-on widgets */}
      <SystemHealth user={user} />
      <TeamStats user={user} />

      {/* Player Portal - Feature flag controlled */}
      {user.role === 'player' && user.features.playerPortal && (
        <PlayerPortalDashboard playerId={user.id} features={user.features} />
      )}

      {/* Org admin tools, only if correct role */}
      {["admin"].includes(user.role) && (
        <>
          {user.features.userManagement && <UserManagementPanel orgId={user.orgId} />}
          <RosterPanel orgId={user.orgId} />
          {user.features.auditLogs && <AuditLogsPanel orgId={user.orgId} />}
          {user.features.dataExport && <DataExportPanel orgId={user.orgId} />}
          {user.features.systemSettings && <SystemSettingsPanel orgId={user.orgId} />}
        </>
      )}

      {/* Payments/Billing, only if feature enabled */}
      {user.features.billing && (
        <BillingPanel orgId={user.orgId} />
      )}

      {/* Advanced analytics, only if feature enabled */}
      {user.features.advancedAnalytics && (
        <AdvancedAnalyticsPanel orgId={user.orgId} />
      )}

      {/* Coach specific widgets */}
      {["coach"].includes(user.role) && (
        <>
          <RosterPanel teamId={user.teamId} />
          {user.features.teamFees && <TeamFeesPanel teamId={user.teamId} />}
          <PracticeScheduleCard />
          <RecentTeamActivity />
        </>
      )}
    </div>
  );
}

// Admin Tools Panel - Actions only for admins
function AdminToolsPanel({ user }) {
  return (
    <div className="bg-zinc-900 border-l-4 border-yellow-400 rounded-lg p-4 space-y-3 shadow-md mt-6">
      <div className="flex items-center gap-2 font-bold text-lg">
        <span className="text-yellow-400">🛡️ Admin Tools</span>
      </div>
      <div className="grid gap-2">
        {user.features.userManagement && <ActionButton label="Manage Users" />}
        <ActionButton label="Team Management" />
        {user.features.advancedAnalytics && <ActionButton label="System Analytics" />}
        {user.features.auditLogs && <ActionButton label="Audit Logs" />}
        {user.features.dataExport && <ActionButton label="Data Export" />}
        {user.features.systemSettings && <ActionButton label="System Settings" />}
      </div>
    </div>
  );
}

// Coach Quick Actions - Team-focused actions
function CoachQuickActions({ user }) {
  return (
    <div className="bg-zinc-900 border-l-4 border-blue-400 rounded-lg p-4 space-y-3 shadow-md mt-6">
      <div className="flex items-center gap-2 font-bold text-lg">
        <span className="text-blue-400">🏀 Team Actions</span>
      </div>
      <div className="grid gap-2">
        <ActionButton label="Add Player to Team" />
        <ActionButton label="Schedule Practice" />
        <ActionButton label="Create Development Plan" />
        <ActionButton label="Log Observation" />
        {user.features.teamFees && <ActionButton label="Manage Team Fees" />}
      </div>
    </div>
  );
}

// Recent Activity Component
function RecentActivity({ user }) {
  const activities = user.role === 'admin' ? [
    { id: 1, type: 'system', message: 'System backup completed successfully', time: '2 hours ago', icon: Database, color: 'green', severity: 'success' },
    { id: 2, type: 'user', message: 'New user invitation sent to coach@team.com', time: '3 hours ago', icon: Mail, color: 'blue', severity: 'info' },
    { id: 3, type: 'alert', message: 'High CPU usage detected on server', time: '4 hours ago', icon: AlertTriangle, color: 'yellow', severity: 'warning' },
    { id: 4, type: 'billing', message: 'Monthly subscription payment processed', time: '1 day ago', icon: CreditCard, color: 'green', severity: 'success' },
    { id: 5, type: 'security', message: 'Failed login attempt from unknown IP', time: '1 day ago', icon: Shield, color: 'red', severity: 'error' },
  ] : [
    { id: 1, type: 'user', message: 'New player added to Team Alpha', time: '2 hours ago', icon: UserPlus, color: 'green', severity: 'info' },
    { id: 2, type: 'plan', message: 'Development plan updated for John Doe', time: '4 hours ago', icon: FileText, color: 'blue', severity: 'info' },
    { id: 3, type: 'observation', message: 'New observation recorded for Team Beta', time: '6 hours ago', icon: Eye, color: 'purple', severity: 'info' },
    { id: 4, type: 'team', message: 'Team Gamma created', time: '8 hours ago', icon: Shield, color: 'orange', severity: 'info' },
    { id: 5, type: 'coach', message: 'Coach Sarah joined the platform', time: '12 hours ago', icon: Users, color: 'cyan', severity: 'info' },
  ];

  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Recent Activity</h2>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50">
              <div className={`p-2 rounded-lg bg-${activity.color}-500/20`}>
                <IconComponent className={`h-4 w-4 text-${activity.color}-500`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{activity.message}</p>
                <p className="text-xs text-zinc-400">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Action Button Component
function ActionButton({ label }) {
  return (
    <button className="w-full px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-left font-medium transition text-white">
      {label}
    </button>
  );
}

// Modular Panel Components

// System Health - Always visible
function SystemHealth({ user }: { user: any }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _user = user;
  const systemHealth = {
    status: 'healthy',
    uptime: '99.9%',
    lastBackup: '2 hours ago',
    activeUsers: 24,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkLatency: 12,
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-[#d8cc97]">System Health & Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">CPU Usage</span>
            <span className="text-sm font-medium text-white">{systemHealth.cpuUsage}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${systemHealth.cpuUsage > 80 ? 'bg-red-500' : systemHealth.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${systemHealth.cpuUsage}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Memory Usage</span>
            <span className="text-sm font-medium text-white">{systemHealth.memoryUsage}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${systemHealth.memoryUsage > 80 ? 'bg-red-500' : systemHealth.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${systemHealth.memoryUsage}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Disk Usage</span>
            <span className="text-sm font-medium text-white">{systemHealth.diskUsage}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${systemHealth.diskUsage > 80 ? 'bg-red-500' : systemHealth.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${systemHealth.diskUsage}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Network Latency</span>
            <span className="text-sm font-medium text-white">{systemHealth.networkLatency}ms</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${systemHealth.networkLatency > 50 ? 'bg-red-500' : systemHealth.networkLatency > 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min((systemHealth.networkLatency / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Team Stats - Always visible
function TeamStats({ user }: { user: any }) {

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-[#d8cc97]">
        {user.role === 'admin' ? 'Platform Overview' : 'My Teams'}
      </h2>
      {user.role === 'admin' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">Platform Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <span className="text-2xl font-bold text-white block">45</span>
                <span className="text-sm text-zinc-400">Total Users</span>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <span className="text-2xl font-bold text-white block">3</span>
                <span className="text-sm text-zinc-400">Teams</span>
              </div>
              <div className="text-center">
                <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <span className="text-2xl font-bold text-white block">24</span>
                <span className="text-sm text-zinc-400">Active Plans</span>
              </div>
              <div className="text-center">
                <UserCheck className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <span className="text-2xl font-bold text-white block">6</span>
                <span className="text-sm text-zinc-400">Coaches</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">Billing & Subscription</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Plan</span>
                <span className="text-sm font-medium text-white">Pro</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Monthly Cost</span>
                <span className="text-sm font-medium text-white">$299</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Status</span>
                <span className="text-sm font-medium text-green-500 capitalize">active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Next Billing</span>
                <span className="text-sm font-medium text-white">2024-02-15</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Team Alpha</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Members</span>
              <span className="text-lg font-bold text-white">8</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Active Plans</span>
              <span className="text-lg font-bold text-white">5</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Last Session</span>
              <span className="text-sm text-white">2 hours ago</span>
            </div>
            <div className="flex space-x-2">
              <UniversalButton.Secondary size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </UniversalButton.Secondary>
              <UniversalButton.Secondary size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </UniversalButton.Secondary>
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Team Beta</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Members</span>
              <span className="text-lg font-bold text-white">6</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Active Plans</span>
              <span className="text-lg font-bold text-white">3</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Last Session</span>
              <span className="text-sm text-white">1 day ago</span>
            </div>
            <div className="flex space-x-2">
              <UniversalButton.Secondary size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </UniversalButton.Secondary>
              <UniversalButton.Secondary size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </UniversalButton.Secondary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Billing Panel - Feature flag controlled
export function BillingPanel({ orgId }: { orgId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _orgId = orgId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">Billing & Subscription</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Plan</span>
          <span className="text-sm font-medium text-white">Pro</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Status</span>
          <span className="text-sm font-medium text-green-500">Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Next Billing</span>
          <span className="text-sm font-medium text-white">2024-12-31</span>
        </div>
        <UniversalButton.Secondary className="mt-3">
          Manage Billing
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// User Management Panel - Role controlled
function UserManagementPanel({ orgId }: { orgId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _orgId = orgId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">User Management</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UniversalButton.Primary>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </UniversalButton.Primary>
        <UniversalButton.Secondary>
          <Users className="h-4 w-4 mr-2" />
          Manage Users
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Shield className="h-4 w-4 mr-2" />
          Role Management
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Security Alerts
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// Roster Panel - Always visible
function RosterPanel({ orgId, teamId }: { orgId?: string; teamId?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _teamId = teamId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">
        {orgId ? 'Organization Roster' : 'Team Roster'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UniversalButton.Primary>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </UniversalButton.Primary>
        <UniversalButton.Secondary>
          <Users className="h-4 w-4 mr-2" />
          View Roster
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <FileText className="h-4 w-4 mr-2" />
          Export Roster
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <BarChart3 className="h-4 w-4 mr-2" />
          Roster Analytics
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// Team Fees Panel - Feature flag controlled
function TeamFeesPanel({ teamId }: { teamId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _teamId = teamId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">Team Fees Management</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Total Collected</span>
          <span className="text-sm font-medium text-white">$2,450</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Outstanding</span>
          <span className="text-sm font-medium text-yellow-500">$150</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Next Due Date</span>
          <span className="text-sm font-medium text-white">2024-01-15</span>
        </div>
        <UniversalButton.Secondary className="mt-3">
          Manage Fees
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// Advanced Analytics Panel - Feature flag controlled
function AdvancedAnalyticsPanel({ orgId }: { orgId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _orgId = orgId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">Advanced Analytics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UniversalButton.Secondary>
          <BarChart3 className="h-4 w-4 mr-2" />
          Usage Analytics
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Activity className="h-4 w-4 mr-2" />
          Performance Metrics
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Database className="h-4 w-4 mr-2" />
          System Logs
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Error Reports
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// Audit Logs Panel - Feature flag controlled
function AuditLogsPanel({ orgId }: { orgId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _orgId = orgId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">Audit Logs</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UniversalButton.Secondary>
          <Clipboard className="h-4 w-4 mr-2" />
          View Logs
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Security Events
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Activity className="h-4 w-4 mr-2" />
          User Activity
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// Data Export Panel - Feature flag controlled
function DataExportPanel({ orgId }: { orgId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _orgId = orgId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">Data Management</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UniversalButton.Secondary>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Database className="h-4 w-4 mr-2" />
          Backup System
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <FileText className="h-4 w-4 mr-2" />
          Import Data
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Shield className="h-4 w-4 mr-2" />
          Data Security
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// System Settings Panel - Feature flag controlled
function SystemSettingsPanel({ orgId }: { orgId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _orgId = orgId;
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">System Settings</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UniversalButton.Secondary>
          <Settings className="h-4 w-4 mr-2" />
          General Settings
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Shield className="h-4 w-4 mr-2" />
          Security Settings
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <CreditCard className="h-4 w-4 mr-2" />
          Billing Settings
        </UniversalButton.Secondary>
        <UniversalButton.Secondary>
          <Database className="h-4 w-4 mr-2" />
          System Config
        </UniversalButton.Secondary>
      </div>
    </div>
  );
}

// Practice Schedule Card - Coach specific
function PracticeScheduleCard() {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-[#d8cc97]">Practice Schedule</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
          <div>
            <p className="text-sm font-medium text-white">Team Alpha Practice</p>
            <p className="text-xs text-zinc-400">Today, 3:00 PM</p>
          </div>
          <UniversalButton.Secondary size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            View
          </UniversalButton.Secondary>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
          <div>
            <p className="text-sm font-medium text-white">Team Beta Practice</p>
            <p className="text-xs text-zinc-400">Tomorrow, 4:00 PM</p>
          </div>
          <UniversalButton.Secondary size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            View
          </UniversalButton.Secondary>
        </div>
      </div>
    </div>
  );
}

// Recent Team Activity - Coach specific
function RecentTeamActivity() {
  const activities = [
    { id: 1, type: 'user', message: 'New player added to Team Alpha', time: '2 hours ago', icon: UserPlus, color: 'green', severity: 'info' },
    { id: 2, type: 'plan', message: 'Development plan updated for John Doe', time: '4 hours ago', icon: FileText, color: 'blue', severity: 'info' },
    { id: 3, type: 'observation', message: 'New observation recorded for Team Beta', time: '6 hours ago', icon: Eye, color: 'purple', severity: 'info' },
    { id: 4, type: 'team', message: 'Team Gamma created', time: '8 hours ago', icon: Shield, color: 'orange', severity: 'info' },
    { id: 5, type: 'coach', message: 'Coach Sarah joined the platform', time: '12 hours ago', icon: Users, color: 'cyan', severity: 'info' },
  ];

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-[#d8cc97]">Recent Team Activity</h2>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-900/50">
              <div className={`p-2 rounded-lg bg-${activity.color}-500/20`}>
                <IconComponent className={`h-4 w-4 text-${activity.color}-500`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{activity.message}</p>
                <p className="text-xs text-zinc-400">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
