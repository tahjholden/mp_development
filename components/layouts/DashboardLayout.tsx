/* eslint-disable react/jsx-no-useless-fragment */
'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';

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
   * Content for an optional far-right column (e.g., extra panel)
   */
  extraRight?: React.ReactNode;
  /**
   * Number of columns to display (2, 3, or 4)
   */
  columns?: 2 | 3 | 4;
  /**
   * Optional: override user info for sidebar/header
   */
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  left,
  center,
  right,
  extraRight,
  columns = 3,
  user = { name: 'Coach', email: 'coach@example.com', role: 'Coach' },
}) => {
  return (
    <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
        <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">{user.name}</span>
          <span className="text-xs text-[#d8cc97] leading-tight">{user.email}</span>
          <span className="text-xs text-white leading-tight">{user.role}</span>
        </div>
      </header>
      {/* Sidebar */}
      <Sidebar user={user} />
      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
        {/* Columns */}
        <div className="flex w-full min-h-screen">
          {/* Left column (always rendered for 2+ columns) */}
          {columns >= 2 && (
            <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen">
              {left || null}
            </div>
          )}
          {/* Center column (always present) */}
          <div className={columns === 2 ? 'w-1/2 p-8 bg-black flex flex-col justify-start min-h-screen' : columns === 3 ? 'w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen' : 'w-1/4 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen'}>
            {center}
          </div>
          {/* Right column (always rendered for 3+ columns) */}
          {columns >= 3 && (
            <div className={columns === 3 ? 'w-1/4 p-6 bg-black flex flex-col justify-start min-h-screen' : 'w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen'}>
              {right || null}
            </div>
          )}
          {/* Extra right column (always rendered for 4 columns) */}
          {columns === 4 && (
            <div className="w-1/4 p-6 bg-black flex flex-col justify-start min-h-screen">
              {extraRight || null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
