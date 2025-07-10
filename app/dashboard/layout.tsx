import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

// Mock user data - in a real app, this would be fetched from your auth system
const mockUser = {
  name: 'Coach Thompson',
  email: 'coach@maxpotential.com',
  role: 'Head Coach',
};

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real application, you would fetch the user data here
  // const user = await getUser();
  
  return (
    <DashboardLayout
      user={mockUser}
      // Additional props can be set here to control layout features
      showSearch={true}
      showQuickActions={true}
      showNotifications={true}
    >
      {children}
    </DashboardLayout>
  );
}
