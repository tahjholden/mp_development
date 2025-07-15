'use client';

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ParentPortalDashboard from '@/components/basketball/ParentPortalDashboard';
import ComingSoon from '@/components/ui/ComingSoon';

// Mock user context - in real app, this would come from auth
const mockUser = {
  id: '1',
  role: 'superadmin', // This would be dynamic based on actual user
  features: {
    parentPortal: true,
  },
};

export default function ParentPortalPage() {
  // Superadmin-only access guard
  if (mockUser.role !== 'superadmin') {
    return (
      <DashboardLayout
        center={
          <ComingSoon
            title="Parent Portal"
            description="The Parent Portal is currently under development and will be available to parents soon."
          />
        }
      />
    );
  }

  return <DashboardLayout center={<ParentPortalDashboard user={mockUser} />} />;
}
