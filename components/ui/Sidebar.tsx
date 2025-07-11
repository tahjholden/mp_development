/* eslint-disable react/jsx-no-useless-fragment */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Award,
  Calendar,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import UniversalButton from './UniversalButton';
import { colors } from '@/lib/design-tokens';

type NavItemType = {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItemType[];
};

type SidebarProps = {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onSignOut?: () => void;
};

const navItems: NavItemType[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: 'Players',
    href: '/players',
    icon: <Users size={20} />,
    children: [
      {
        title: 'All Players',
        href: '/players',
        icon: <ChevronRight size={16} />,
      },
      {
        title: 'Development Plans',
        href: '/players/development',
        icon: <ChevronRight size={16} />,
      },
      {
        title: 'Observations',
        href: '/players/observations',
        icon: <ChevronRight size={16} />,
      },
    ],
  },
  {
    title: 'Teams',
    href: '/teams',
    icon: <Users size={20} />,
  },
  {
    title: 'Coaches',
    href: '/coaches',
    icon: <UserRound size={20} />,
  },
  {
    title: 'Sessions',
    href: '/sessions',
    icon: <Calendar size={20} />,
  },
  {
    title: 'Drills',
    href: '/drills',
    icon: <ClipboardList size={20} />,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 size={20} />,
  },
  {
    title: 'Resources',
    href: '/resources',
    icon: <BookOpen size={20} />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings size={20} />,
  },
];

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Close mobile sidebar when pathname changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Pre-expand the item that contains the current path
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const shouldExpand = item.children.some((child) => pathname.startsWith(child.href));
        if (shouldExpand) {
          setExpandedItems((prev) => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ease-in-out",
          "w-64 md:w-64 md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-center h-16 border-b border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Award size={24} className="text-gold-500" />
            <span className="text-lg font-semibold text-white">MP Basketball</span>
          </Link>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-zinc-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/50 flex items-center justify-center text-gold-500 font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-gold-500/20 text-gold-500">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-16rem)]">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium",
                        isActive(item.href)
                          ? "bg-gold-500/20 text-gold-500"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      )}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.title}
                      </div>
                      {expandedItems[item.title] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {expandedItems[item.title] && (
                      <ul className="pl-10 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.title}>
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                                isActive(child.href)
                                  ? "bg-gold-500/20 text-gold-500"
                                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                              )}
                            >
                              <span className="mr-2">{child.icon}</span>
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                      isActive(item.href)
                        ? "bg-gold-500/20 text-gold-500"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          {onSignOut && (
            <UniversalButton.Ghost
              onClick={onSignOut}
              className="w-full justify-start text-zinc-400 hover:text-white"
              leftIcon={<LogOut size={18} />}
            >
              Sign Out
            </UniversalButton.Ghost>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
