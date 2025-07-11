/* eslint-disable react/jsx-no-useless-fragment */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  title?: string;
  showSearch?: boolean;
  showQuickActions?: boolean;
  showNotifications?: boolean;
  showBreadcrumbs?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function DashboardLayout({
  children,
  user,
  title,
  showSearch = true,
  showQuickActions = true,
  showNotifications = true,
  showBreadcrumbs = true,
  onSearch,
  className,
}: DashboardLayoutProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    // This would typically call your sign-out function
    // For now, just redirect to sign-in page
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <Sidebar user={user} onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <div className="md:pl-64">
        {/* Header */}
        <Header
          title={title}
          showSearch={showSearch}
          showQuickActions={showQuickActions}
          showNotifications={showNotifications}
          showBreadcrumbs={showBreadcrumbs}
          onSearch={onSearch}
        />

        {/* Page Content */}
        <main className={cn("p-4 sm:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Higher-order component to wrap pages with the dashboard layout
export function withDashboardLayout(
  Component: React.ComponentType<any>,
  layoutProps?: Omit<DashboardLayoutProps, 'children'>
) {
  return function WrappedComponent(props: any) {
    return (
      <DashboardLayout {...layoutProps}>
        <Component {...props} />
      </DashboardLayout>
    );
  };
}

export default DashboardLayout;
