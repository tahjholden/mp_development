'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Shield,
  AlertTriangle,
  Clock,
  Settings,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';

// Types for audit logs
interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'data' | 'system' | 'user' | 'admin';
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
}

interface SecurityEvent {
  id: string;
  type:
    | 'login'
    | 'logout'
    | 'permission_change'
    | 'data_access'
    | 'system_change';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolution?: string;
}

interface SystemMetrics {
  totalLogs: number;
  securityEvents: number;
  failedLogins: number;
  dataAccessEvents: number;
  lastUpdated: string;
}

// Role-specific content for audit logs
const getAuditLogsContent = (role: string) => {
  const baseContent = {
    title: 'Audit Logs',
    description: 'Monitor system activity and security events',
  };

  switch (role) {
    case 'admin':
    case 'superadmin':
      return {
        ...baseContent,
        title: 'System Audit Logs',
        description:
          'Comprehensive system monitoring and security event tracking',
        logs: [
          {
            id: '1',
            timestamp: '2024-01-15 14:30:22',
            user: 'admin@example.com',
            action: 'USER_PERMISSION_CHANGED',
            resource: 'Player Management',
            details: 'Changed player access permissions for team Varsity Boys',
            severity: 'high' as const,
            category: 'security' as const,
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            status: 'success' as const,
          },
          {
            id: '2',
            timestamp: '2024-01-15 14:25:15',
            user: 'coach.johnson@example.com',
            action: 'DATA_EXPORT',
            resource: 'Player Analytics',
            details: 'Exported player performance data for last 30 days',
            severity: 'medium' as const,
            category: 'data' as const,
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            status: 'success' as const,
          },
          {
            id: '3',
            timestamp: '2024-01-15 14:20:08',
            user: 'unknown',
            action: 'LOGIN_FAILED',
            resource: 'Authentication',
            details: 'Failed login attempt with invalid credentials',
            severity: 'medium' as const,
            category: 'security' as const,
            ipAddress: '203.0.113.45',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            status: 'failure' as const,
          },
          {
            id: '4',
            timestamp: '2024-01-15 14:15:33',
            user: 'system',
            action: 'BACKUP_COMPLETED',
            resource: 'Database',
            details: 'Daily backup completed successfully',
            severity: 'low' as const,
            category: 'system' as const,
            ipAddress: '127.0.0.1',
            userAgent: 'System/BackupService',
            status: 'success' as const,
          },
        ],
        securityEvents: [
          {
            id: '1',
            type: 'permission_change' as const,
            title: 'User Permission Modified',
            description: 'Admin changed user permissions for player management',
            timestamp: '2024-01-15 14:30:22',
            user: 'admin@example.com',
            severity: 'high' as const,
            resolved: false,
          },
          {
            id: '2',
            type: 'login' as const,
            title: 'Suspicious Login Attempt',
            description: 'Multiple failed login attempts from unknown IP',
            timestamp: '2024-01-15 14:20:08',
            user: 'unknown',
            severity: 'medium' as const,
            resolved: true,
            resolution: 'IP blocked automatically',
          },
        ],
        metrics: {
          totalLogs: 1247,
          securityEvents: 23,
          failedLogins: 8,
          dataAccessEvents: 156,
          lastUpdated: '2024-01-15 14:35:00',
        },
      };
    case 'coach':
      return {
        ...baseContent,
        title: 'Activity Logs',
        description: 'Track your team management activities and data access',
        logs: [
          {
            id: '1',
            timestamp: '2024-01-15 14:30:22',
            user: 'coach.johnson@example.com',
            action: 'PLAYER_DATA_ACCESSED',
            resource: 'Player Profiles',
            details: 'Viewed player performance data for team Varsity Boys',
            severity: 'low' as const,
            category: 'data' as const,
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            status: 'success' as const,
          },
          {
            id: '2',
            timestamp: '2024-01-15 14:25:15',
            user: 'coach.johnson@example.com',
            action: 'SESSION_CREATED',
            resource: 'Practice Sessions',
            details: 'Created new practice session for tomorrow',
            severity: 'low' as const,
            category: 'user' as const,
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            status: 'success' as const,
          },
        ],
        securityEvents: [
          {
            id: '1',
            type: 'data_access' as const,
            title: 'Data Access Logged',
            description: 'Accessed player performance data',
            timestamp: '2024-01-15 14:30:22',
            user: 'coach.johnson@example.com',
            severity: 'low' as const,
            resolved: true,
            resolution: 'Normal activity',
          },
        ],
        metrics: {
          totalLogs: 89,
          securityEvents: 2,
          failedLogins: 0,
          dataAccessEvents: 45,
          lastUpdated: '2024-01-15 14:35:00',
        },
      };
    default:
      return {
        ...baseContent,
        logs: [],
        securityEvents: [],
        metrics: {
          totalLogs: 0,
          securityEvents: 0,
          failedLogins: 0,
          dataAccessEvents: 0,
          lastUpdated: '2024-01-15 14:35:00',
        },
      };
  }
};

// Main component
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Filter states
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);

  // Mock user role - in real app this would come from auth context
  const userRole = 'admin'; // This would be dynamic based on user role
  const auditContent = useMemo(() => getAuditLogsContent(userRole), [userRole]);

  const filteredLogs = logs.filter(log => {
    const matchesCategory =
      categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity =
      severityFilter === 'all' || log.severity === severityFilter;
    return matchesCategory && matchesSeverity;
  });

  // Handle log selection
  const handleLogSelect = (logId: string) => {
    if (selectedLogId === logId) {
      setSelectedLogId(null);
    } else {
      setSelectedLogId(logId);
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

        // Get audit content inside the effect
        const auditContent = getAuditLogsContent(userRole);

        // Set audit logs data
        setLogs(auditContent.logs);
        setSecurityEvents(auditContent.securityEvents);
        setMetrics(auditContent.metrics);

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch audit data'
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - effect runs once on mount

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
            {auditContent.title}
          </h1>
          <p className="text-zinc-400">{auditContent.description}</p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Audit Logs */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#d8cc97] flex items-center gap-2">
                <Shield size={20} />
                Activity Logs
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded text-sm hover:bg-zinc-700 transition-colors"
                  >
                    <Filter size={16} />
                    {categoryFilter === 'all' ? 'All' : categoryFilter}
                    {isCategoryDropdownOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded shadow-lg z-10 min-w-[120px]">
                      {[
                        'all',
                        'security',
                        'data',
                        'system',
                        'user',
                        'admin',
                      ].map(category => (
                        <button
                          key={category}
                          onClick={() => {
                            setCategoryFilter(category);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors capitalize"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsSeverityDropdownOpen(!isSeverityDropdownOpen)
                    }
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded text-sm hover:bg-zinc-700 transition-colors"
                  >
                    <Filter size={16} />
                    {severityFilter === 'all' ? 'All' : severityFilter}
                    {isSeverityDropdownOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {isSeverityDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded shadow-lg z-10 min-w-[120px]">
                      {['all', 'low', 'medium', 'high', 'critical'].map(
                        severity => (
                          <button
                            key={severity}
                            onClick={() => {
                              setSeverityFilter(severity);
                              setIsSeverityDropdownOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors capitalize"
                          >
                            {severity}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div
                  key={log.id}
                  onClick={() => handleLogSelect(log.id)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedLogId === log.id
                      ? 'border-[#d8cc97] bg-zinc-800'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{log.action}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs capitalize ${
                          log.severity === 'critical'
                            ? 'bg-red-900 text-red-300'
                            : log.severity === 'high'
                              ? 'bg-orange-900 text-orange-300'
                              : log.severity === 'medium'
                                ? 'bg-yellow-900 text-yellow-300'
                                : 'bg-green-900 text-green-300'
                        }`}
                      >
                        {log.severity}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          log.status === 'success'
                            ? 'bg-green-900 text-green-300'
                            : log.status === 'failure'
                              ? 'bg-red-900 text-red-300'
                              : 'bg-yellow-900 text-yellow-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-zinc-400">
                    <p>
                      <strong>User:</strong> {log.user}
                    </p>
                    <p>
                      <strong>Resource:</strong> {log.resource}
                    </p>
                    <p>
                      <strong>Details:</strong> {log.details}
                    </p>
                    <p>
                      <strong>IP:</strong> {log.ipAddress}
                    </p>
                    <p>
                      <strong>Time:</strong> {log.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - Security Events */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Security Events
            </h2>

            <div className="space-y-4">
              {securityEvents.map(event => (
                <div
                  key={event.id}
                  className="border border-zinc-700 rounded p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        event.severity === 'critical'
                          ? 'bg-red-900 text-red-300'
                          : event.severity === 'high'
                            ? 'bg-orange-900 text-orange-300'
                            : event.severity === 'medium'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-green-900 text-green-300'
                      }`}
                    >
                      {event.severity}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 mb-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">User:</span>
                      <span className="text-white">{event.user}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Time:</span>
                      <span className="text-white">{event.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status:</span>
                      <span
                        className={`${
                          event.resolved ? 'text-green-300' : 'text-yellow-300'
                        }`}
                      >
                        {event.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </div>
                    {event.resolution && (
                      <div className="mt-2 p-2 bg-zinc-800 rounded">
                        <p className="text-xs text-zinc-400">Resolution:</p>
                        <p className="text-sm text-white">{event.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - System Metrics */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <Settings size={20} />
              System Metrics
            </h2>

            {metrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-800 rounded">
                    <p className="text-sm text-zinc-400">Total Logs</p>
                    <p className="text-2xl font-bold text-[#d8cc97]">
                      {metrics.totalLogs}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded">
                    <p className="text-sm text-zinc-400">Security Events</p>
                    <p className="text-2xl font-bold text-red-400">
                      {metrics.securityEvents}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded">
                    <p className="text-sm text-zinc-400">Failed Logins</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {metrics.failedLogins}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded">
                    <p className="text-sm text-zinc-400">Data Access</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {metrics.dataAccessEvents}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800 rounded">
                  <h3 className="text-lg font-medium text-[#d8cc97] mb-2 flex items-center gap-2">
                    <Clock size={18} />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-zinc-300">
                        System backup completed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-zinc-300">
                        Failed login attempt detected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-zinc-300">
                        Data export requested
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 text-center">
                  Last updated: {metrics.lastUpdated}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay - Hidden for superadmin */}
      {user?.personType !== 'superadmin' && (
        <ComingSoonOverlay
          title="Audit Log Features Coming Soon!"
          description="We're building comprehensive audit logging with real-time monitoring, advanced security analytics, and automated threat detection. Stay tuned for enhanced security and compliance features."
        />
      )}
    </div>
  );
}
