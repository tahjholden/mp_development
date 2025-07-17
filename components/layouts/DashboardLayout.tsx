'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import AddPlayerModal from '@/components/modals/AddPlayerModal';
import AddTeamModal from '@/components/modals/AddTeamModal';
import AddCoachModal from '@/components/modals/AddCoachModal';
import AddParentModal from '@/components/modals/AddParentModal';

interface DashboardLayoutProps {
  /**
   * Content for the leftmost column (e.g., player list, navigation, etc.)
   */
  left?: React.ReactNode;
  /**
   * Content for the main/center column (primary content)
   */
  center: React.ReactNode;
  /**
   * Content for the right column (e.g., insights, activity, etc.)
   */
  right?: React.ReactNode;
  /**
   * Optional: override user info for sidebar/header
   */
  user?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    personType?: string;
  };
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  left,
  center,
  right,
  user: propUser = { name: 'Coach', email: 'coach@example.com', role: 'Coach' },
}) => {
  const [user, setUser] = useState(propUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/session');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen h-full bg-black text-white">
        <Sidebar
          user={{
            name: 'Coach',
            email: 'coach@example.com',
            role: 'Coach'
          }}
          onSignOut={() => {}}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between">
            <span
              className="text-2xl font-bold tracking-wide text-[#d8cc97]"
              style={{ letterSpacing: '0.04em' }}
            >
              MP Player Development
            </span>
            <div className="flex flex-col items-end">
              <span className="text-base font-semibold text-white leading-tight">
                Coach
              </span>
              <span className="text-xs text-[#d8cc97] leading-tight">
                coach@example.com
              </span>
              <span className="text-xs text-white leading-tight">Coach</span>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8cc97] mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen h-full bg-black text-white">
        <Sidebar
          user={{
            name: 'Coach',
            email: 'coach@example.com',
            role: 'Coach',
          }}
          onSignOut={() => {}}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between">
            <span
              className="text-2xl font-bold tracking-wide text-[#d8cc97]"
              style={{ letterSpacing: '0.04em' }}
            >
              MP Player Development
            </span>
            <div className="flex flex-col items-end">
              <span className="text-base font-semibold text-white leading-tight">
                Coach
              </span>
              <span className="text-xs text-[#d8cc97] leading-tight">
                coach@example.com
              </span>
              <span className="text-xs text-white leading-tight">Coach</span>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <p className="text-red-400">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine user role for conditional rendering
  const userRole = user?.personType || 'coach';

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      {/* Header - Fixed at top spanning full width */}
      <header
        className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between"
        style={{ boxShadow: 'none' }}
      >
        <span
          className="text-2xl font-bold tracking-wide text-[#d8cc97]"
          style={{ letterSpacing: '0.04em' }}
        >
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">
            {user?.name ||
              `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
              `User ${user?.id}`}
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            {user?.email}
          </span>
          <span className="text-xs text-white leading-tight capitalize">
            {userRole === 'superadmin'
              ? 'SuperAdmin'
              : userRole === 'admin'
                ? 'Admin'
                : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        user={{
          name:
            user?.name ||
            `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
            'Unknown User',
          email: user?.email || 'unknown@example.com',
          role:
            user?.personType === 'superadmin'
              ? 'SuperAdmin'
              : user?.personType === 'admin'
                ? 'Admin'
                : 'Coach',
        }}
        onSignOut={() => {}}
      />

      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen">
        {/* LEFT COLUMN: Entity Panel */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen">
          {left || null}
        </div>

        {/* CENTER COLUMN: Main Panel */}
        <div className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen space-y-8">
          {center}
        </div>

        {/* RIGHT COLUMN: Right Panel */}
        <div className="w-1/4 p-6 bg-black flex flex-col justify-start min-h-screen">
          {right || null}
        </div>
        
        {/* Floating Action Button */}
        <FloatingActionButton />
      </div>
      
      {/* Modals - Rendered at the root level */}
      <AddPlayerModal />
      <AddTeamModal />
      <AddCoachModal />
      <AddParentModal />
    </div>
  );
};

export default DashboardLayout;
