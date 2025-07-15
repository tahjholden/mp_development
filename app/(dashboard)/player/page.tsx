'use client';

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PlayerPortalDashboard from '@/components/basketball/PlayerPortalDashboard';
import ComingSoon from '@/components/ui/ComingSoon';

// Mock user context - in real app, this would come from auth
const mockUser = {
  id: '1',
  role: 'superadmin', // This would be dynamic based on actual user
  features: {
    playerPortal: true,
  },
};

export default function PlayerPortalPage() {
  // Superadmin-only access guard
  if (mockUser.role !== 'superadmin') {
    return (
      <DashboardLayout
        center={
          <ComingSoon
            title="Player Portal"
            description="The Player Portal is currently under development and will be available to players soon."
          />
        }
      />
    );
  }

  return (
    <DashboardLayout
      center={
        <PlayerPortalDashboard
          playerId={mockUser.id}
          features={mockUser.features}
        />
      }
    />
  );
}
