'use client';

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ComingSoon from '@/components/ui/ComingSoon';

// Mock user context - in real app, this would come from auth
const mockUser = {
  id: '1',
  role: 'superadmin', // This would be dynamic based on actual user
  features: {
    auditLogs: true,
  },
};

export default function AuditLogsPage() {
  // Superadmin-only access guard
  if (mockUser.role !== 'superadmin') {
    return (
      <DashboardLayout
        center={
          <ComingSoon
            title="Audit Logs"
            description="The Audit Logs system is currently under development and will be available to organization admins soon."
          />
        }
      />
    );
  }

  return (
    <DashboardLayout
      center={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#d8cc97]">Audit Logs</h1>
          <p className="text-zinc-400">
            Superadmin-only audit logs interface for testing and development.
          </p>
          <div className="p-6 bg-zinc-800/50 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">
              Development Mode
            </h2>
            <p className="text-sm text-zinc-400">
              This is the superadmin-only audit logs interface. In production,
              this would show:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-400 mt-2 space-y-1">
              <li>User activity logs</li>
              <li>System access records</li>
              <li>Data modification history</li>
              <li>Security event tracking</li>
              <li>Compliance reporting</li>
            </ul>
          </div>
        </div>
      }
    />
  );
}
