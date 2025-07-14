import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

// Mock user data - in a real app, this would be fetched from your auth system
const mockUser = {
  name: 'Coach Thompson',
  email: 'coach@maxpotential.com',
  role: 'Head Coach',
};

export default function DatabaseTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real application, you would fetch the user data here
  // const user = await getUser();

  return (
    <DashboardLayout
      user={mockUser}
      title="Database Test"
      showSearch={true}
      showQuickActions={false}
      showBreadcrumbs={true}
    >
      {children}
    </DashboardLayout>
  );
}
