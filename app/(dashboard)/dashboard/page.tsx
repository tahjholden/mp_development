'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import UniversalButton from '@/components/ui/UniversalButton';
import UniversalCard from '@/components/ui/UniversalCard';
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
  Loader2,
} from 'lucide-react';

// Role-based dashboard component
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user data...');
        const response = await fetch('/api/user/session');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser(userData.user);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout
        left={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#d8cc97]" />
          </div>
        }
        center={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#d8cc97]" />
          </div>
        }
        right={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#d8cc97]" />
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <DashboardLayout
        left={<div className="text-red-400">Error: {error}</div>}
        center={<div className="text-red-400">Error: {error}</div>}
        right={<div className="text-red-400">Error: {error}</div>}
      />
    );
  }

  // Determine user role for conditional rendering
  const userRole = user?.personType || 'coach';

  return (
    <DashboardLayout
      left={<EntityPanel user={user} />}
      center={
        <MainPanel>
          <DashboardHome user={user} />
        </MainPanel>
      }
      right={
        <RightPanel>
          <RecentActivity user={user} />
          {/* Admin-only tools */}
          <AdminToolsPanel user={user} />
          {/* Coach quick actions */}
          <CoachQuickActions user={user} />
        </RightPanel>
      }
    />
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
    <div className="space-y-6">
      {user.primaryRole === 'admin' || user.primaryRole === 'superadmin' ? (
        <>
          <h2 className="text-xl font-bold text-[#d8cc97]">System Overview</h2>
          <div className="space-y-6">
            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {adminStats.totalUsers}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>

            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    Total Teams
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {adminStats.totalTeams}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>

            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    Active Plans
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {adminStats.activePlans}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>

            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <UserCheck className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    Total Coaches
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {adminStats.totalCoaches}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>

            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    System Alerts
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {adminStats.systemAlerts}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-[#d8cc97]">My Stats</h2>
          <div className="space-y-6">
            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    My Players
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {coachStats.totalPlayers}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>

            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Award className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">My Teams</p>
                  <p className="text-2xl font-bold text-white">
                    {coachStats.totalTeams}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>

            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    Active Plans
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {coachStats.activePlans}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>

            <UniversalCard.StatCard>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Activity className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-zinc-400">
                    Recent Observations
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {coachStats.recentObservations}
                  </p>
                </div>
              </div>
            </UniversalCard.StatCard>
          </div>
        </>
      )}
    </div>
  );
}

// Main Panel wrapper
function MainPanel({ children }) {
  return <div className="space-y-8">{children}</div>;
}

// Right Panel wrapper
function RightPanel({ children }) {
  return <div className="space-y-6">{children}</div>;
}

// Main Dashboard Home – Modular, Feature-Flag Ready
function DashboardHome({ user }) {
  return (
    <div className="space-y-6">
      {/* Superadmin-only widgets */}
      {user.isSuperadmin && <SystemHealth user={user} />}

      {/* Always-on widgets */}
      <TeamStats user={user} />

      {/* Player Portal - Feature flag controlled */}
      {user.primaryRole === 'player' && user.features?.playerPortal && (
        <PlayerPortalDashboard playerId={user.id} features={user.features} />
      )}

      {/* Org admin tools, only if correct role */}
      {user.isAdmin && (
        <>
          {user.features?.userManagement && (
            <UserManagementPanel orgId={user.organizationId} />
          )}
          <RosterPanel orgId={user.organizationId} />
          {user.features?.auditLogs && (
            <AuditLogsPanel orgId={user.organizationId} />
          )}
          {user.features?.dataExport && (
            <DataExportPanel orgId={user.organizationId} />
          )}
          {user.features?.systemSettings && (
            <SystemSettingsPanel orgId={user.organizationId} />
          )}
        </>
      )}

      {/* Payments/Billing, only if feature enabled */}
      {user.features?.billing && <BillingPanel orgId={user.organizationId} />}

      {/* Advanced analytics, only if feature enabled */}
      {user.features?.advancedAnalytics && (
        <AdvancedAnalyticsPanel orgId={user.organizationId} />
      )}

      {/* Coach specific widgets */}
      {user.primaryRole === 'coach' && (
        <>
          <RosterPanel teamId={user.teamId} />
          {user.features?.teamFees && <TeamFeesPanel teamId={user.teamId} />}
          <PracticeScheduleCard />
          <RecentTeamActivity />
        </>
      )}
    </div>
  );
}

// Admin Tools Panel - Actions only for admins
function AdminToolsPanel({ user }) {
  // Provide default features if not available
  const features = user.features || {
    teamFees: false,
    playerPortal: false,
    userManagement: false,
    auditLogs: false,
    dataExport: false,
    systemSettings: false,
    billing: false,
    advancedAnalytics: false,
  };

  return (
    <UniversalCard.Default
      title="🛡️ Admin Tools"
      subtitle="Administrative actions"
      color="gold"
    >
      <div className="grid gap-2">
        {features.userManagement && <ActionButton label="Manage Users" />}
        <ActionButton label="Team Management" />
        {features.advancedAnalytics && (
          <ActionButton label="System Analytics" />
        )}
        {features.auditLogs && <ActionButton label="Audit Logs" />}
        {features.dataExport && <ActionButton label="Data Export" />}
        {features.systemSettings && <ActionButton label="System Settings" />}
      </div>
    </UniversalCard.Default>
  );
}

// Coach Quick Actions - Team-focused actions
function CoachQuickActions({ user }) {
  // Provide default features if not available
  const features = user.features || {
    teamFees: false,
    playerPortal: false,
    userManagement: false,
    auditLogs: false,
    dataExport: false,
    systemSettings: false,
    billing: false,
    advancedAnalytics: false,
  };

  return (
    <UniversalCard.Default
      title="🏀 Team Actions"
      subtitle="Team management tools"
      color="gold"
    >
      <div className="grid gap-2">
        <ActionButton label="Add Player to Team" />
        <ActionButton label="Schedule Practice" />
        <ActionButton label="Create Development Plan" />
        <ActionButton label="Log Observation" />
        {features.teamFees && <ActionButton label="Manage Team Fees" />}
      </div>
    </UniversalCard.Default>
  );
}

// Recent Activity Component
function RecentActivity({ user }) {
  const activities = user.isAdmin
    ? [
        {
          id: 1,
          type: 'system',
          message: 'System backup completed successfully',
          time: '2 hours ago',
          icon: Database,
          color: 'green',
          severity: 'success',
        },
        {
          id: 2,
          type: 'user',
          message: 'New user invitation sent to coach@team.com',
          time: '3 hours ago',
          icon: Mail,
          color: 'blue',
          severity: 'info',
        },
        {
          id: 3,
          type: 'alert',
          message: 'High CPU usage detected on server',
          time: '4 hours ago',
          icon: AlertTriangle,
          color: 'yellow',
          severity: 'warning',
        },
        {
          id: 4,
          type: 'billing',
          message: 'Monthly subscription payment processed',
          time: '1 day ago',
          icon: CreditCard,
          color: 'green',
          severity: 'success',
        },
        {
          id: 5,
          type: 'security',
          message: 'Failed login attempt from unknown IP',
          time: '1 day ago',
          icon: Shield,
          color: 'red',
          severity: 'error',
        },
      ]
    : [
        {
          id: 1,
          type: 'user',
          message: 'New player added to Team Alpha',
          time: '2 hours ago',
          icon: UserPlus,
          color: 'green',
          severity: 'info',
        },
        {
          id: 2,
          type: 'plan',
          message: 'Development plan updated for John Doe',
          time: '4 hours ago',
          icon: FileText,
          color: 'blue',
          severity: 'info',
        },
        {
          id: 3,
          type: 'observation',
          message: 'New observation recorded for Team Beta',
          time: '6 hours ago',
          icon: Eye,
          color: 'purple',
          severity: 'info',
        },
        {
          id: 4,
          type: 'team',
          message: 'Team Gamma created',
          time: '8 hours ago',
          icon: Shield,
          color: 'orange',
          severity: 'info',
        },
        {
          id: 5,
          type: 'coach',
          message: 'Coach Sarah joined the platform',
          time: '12 hours ago',
          icon: Users,
          color: 'cyan',
          severity: 'info',
        },
      ];

  return (
    <>
      <h2 className="text-xl font-bold text-[#d8cc97]">Recent Activity</h2>
      <div className="space-y-4">
        {activities.slice(0, 5).map(activity => {
          const IconComponent = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-800/50"
            >
              <div className={`p-2 rounded-lg bg-${activity.color}-500/20`}>
                <IconComponent
                  className={`h-4 w-4 text-${activity.color}-500`}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {activity.message}
                </p>
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
function SystemHealth({ user }) {
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
    <UniversalCard.Default
      title="System Health & Performance"
      subtitle="Platform monitoring and metrics"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">CPU Usage</span>
            <span className="text-sm font-medium text-white">
              {systemHealth.cpuUsage}%
            </span>
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
            <span className="text-sm font-medium text-white">
              {systemHealth.memoryUsage}%
            </span>
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
            <span className="text-sm font-medium text-white">
              {systemHealth.diskUsage}%
            </span>
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
            <span className="text-sm font-medium text-white">
              {systemHealth.networkLatency}ms
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${systemHealth.networkLatency > 50 ? 'bg-red-500' : systemHealth.networkLatency > 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{
                width: `${Math.min((systemHealth.networkLatency / 100) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </UniversalCard.Default>
  );
}

// Team Stats - Always visible
function TeamStats({ user }) {
  return (
    <UniversalCard.Default
      title={user.role === 'admin' ? 'Platform Overview' : 'My Teams'}
      subtitle="Team and platform statistics"
    >
      {user.role === 'admin' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">
              Platform Overview
            </h3>
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
            <h3 className="text-lg font-semibold mb-4 text-[#d8cc97]">
              Billing & Subscription
            </h3>
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
                <span className="text-sm font-medium text-green-500 capitalize">
                  active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Next Billing</span>
                <span className="text-sm font-medium text-white">
                  2024-02-15
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Team Alpha
            </h3>
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
    </UniversalCard.Default>
  );
}

// Billing Panel - Feature flag controlled
function BillingPanel({ orgId }) {
  return (
    <UniversalCard.Default
      title="Billing & Subscription"
      subtitle="Payment and subscription management"
    >
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
    </UniversalCard.Default>
  );
}

// User Management Panel - Role controlled
function UserManagementPanel({ orgId }) {
  return (
    <UniversalCard.Default
      title="User Management"
      subtitle="User administration and roles"
    >
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
    </UniversalCard.Default>
  );
}

// Roster Panel - Always visible
function RosterPanel({ orgId, teamId }) {
  return (
    <UniversalCard.Default
      title={orgId ? 'Organization Roster' : 'Team Roster'}
      subtitle="Player and team management"
    >
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
    </UniversalCard.Default>
  );
}

// Team Fees Panel - Feature flag controlled
function TeamFeesPanel({ teamId }) {
  return (
    <UniversalCard.Default
      title="Team Fees Management"
      subtitle="Financial tracking and payments"
    >
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
    </UniversalCard.Default>
  );
}

// Advanced Analytics Panel - Feature flag controlled
function AdvancedAnalyticsPanel({ orgId }) {
  return (
    <UniversalCard.Default
      title="Advanced Analytics"
      subtitle="Performance and usage metrics"
    >
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
    </UniversalCard.Default>
  );
}

// Audit Logs Panel - Feature flag controlled
function AuditLogsPanel({ orgId }) {
  return (
    <UniversalCard.Default
      title="Audit Logs"
      subtitle="Security and activity tracking"
    >
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
    </UniversalCard.Default>
  );
}

// Data Export Panel - Feature flag controlled
function DataExportPanel({ orgId }) {
  return (
    <UniversalCard.Default
      title="Data Management"
      subtitle="Import, export, and backup"
    >
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
    </UniversalCard.Default>
  );
}

// System Settings Panel - Feature flag controlled
function SystemSettingsPanel({ orgId }) {
  return (
    <UniversalCard.Default
      title="System Settings"
      subtitle="Configuration and preferences"
    >
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
    </UniversalCard.Default>
  );
}

// Practice Schedule Card - Coach specific
function PracticeScheduleCard() {
  return (
    <UniversalCard.Default
      title="Practice Schedule"
      subtitle="Upcoming team sessions"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
          <div>
            <p className="text-sm font-medium text-white">
              Team Alpha Practice
            </p>
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
    </UniversalCard.Default>
  );
}

// Recent Team Activity - Coach specific
function RecentTeamActivity() {
  const activities = [
    {
      id: 1,
      type: 'user',
      message: 'New player added to Team Alpha',
      time: '2 hours ago',
      icon: UserPlus,
      color: 'green',
      severity: 'info',
    },
    {
      id: 2,
      type: 'plan',
      message: 'Development plan updated for John Doe',
      time: '4 hours ago',
      icon: FileText,
      color: 'blue',
      severity: 'info',
    },
    {
      id: 3,
      type: 'observation',
      message: 'New observation recorded for Team Beta',
      time: '6 hours ago',
      icon: Eye,
      color: 'purple',
      severity: 'info',
    },
    {
      id: 4,
      type: 'team',
      message: 'Team Gamma created',
      time: '8 hours ago',
      icon: Shield,
      color: 'orange',
      severity: 'info',
    },
    {
      id: 5,
      type: 'coach',
      message: 'Coach Sarah joined the platform',
      time: '12 hours ago',
      icon: Users,
      color: 'cyan',
      severity: 'info',
    },
  ];

  return (
    <UniversalCard.Default
      title="Recent Team Activity"
      subtitle="Latest team updates and events"
    >
      <div className="space-y-4">
        {activities.slice(0, 5).map(activity => {
          const IconComponent = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 rounded-lg bg-zinc-900/50"
            >
              <div className={`p-2 rounded-lg bg-${activity.color}-500/20`}>
                <IconComponent
                  className={`h-4 w-4 text-${activity.color}-500`}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {activity.message}
                </p>
                <p className="text-xs text-zinc-400">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </UniversalCard.Default>
  );
}

// Placeholder for PlayerPortalDashboard
function PlayerPortalDashboard({ playerId, features }) {
  return (
    <UniversalCard.Default
      title="Player Portal"
      subtitle="Player-specific dashboard"
    >
      <p className="text-zinc-400">Player portal content would go here</p>
    </UniversalCard.Default>
  );
}
