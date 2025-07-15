'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  CreditCard,
  Shield,
  UserCheck,
  Beaker,
} from 'lucide-react';
import UniversalButton from './UniversalButton';

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

const getNavItems = (userRole?: string): NavItemType[] => {
  const baseItems: NavItemType[] = [
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
          href: '/development-plans',
          icon: <ChevronRight size={16} />,
        },
        {
          title: 'Observations',
          href: '/observations',
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

  // Superadmin-only dev links
  if (userRole === 'superadmin') {
    baseItems.push({
      title: '🛠️ Dev Tools',
      href: '#',
      icon: <Shield size={20} />,
      children: [
        {
          title: 'Simulation Mode',
          href: '/simulation-test',
          icon: <Beaker size={16} />,
        },
        {
          title: 'Player Portal',
          href: '/player',
          icon: <UserCheck size={16} />,
        },
        {
          title: 'Parent Portal',
          href: '/parent',
          icon: <Users size={16} />,
        },
        {
          title: 'Billing',
          href: '/billing',
          icon: <CreditCard size={16} />,
        },
        {
          title: 'Audit Logs',
          href: '/audit-logs',
          icon: <Shield size={16} />,
        },
      ],
    });
  }

  return baseItems;
};

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const navItems = useMemo(() => getNavItems(user?.role), [user?.role]);

  // Close mobile sidebar when pathname changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Pre-expand the item that contains the current path
  useEffect(() => {
    navItems.forEach((item: NavItemType) => {
      if (item.children) {
        const shouldExpand = item.children.some((child: NavItemType) =>
          pathname.startsWith(child.href)
        );
        if (shouldExpand) {
          setExpandedItems(prev => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [pathname, navItems]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => ({
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
          'fixed top-0 left-0 z-40 h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ease-in-out',
          'w-64 md:w-64 md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-center h-16 border-b border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Award size={24} className="text-gold-500" />
            <span className="text-lg font-semibold text-white">
              MP Basketball
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-16rem)]">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium',
                        isActive(item.href)
                          ? 'bg-gold-500/20 text-gold-500'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
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
                        {item.children.map(child => (
                          <li key={child.title}>
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center px-3 py-2 rounded-md text-sm font-medium',
                                isActive(child.href)
                                  ? 'bg-gold-500/20 text-gold-500'
                                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
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
                      'flex items-center px-3 py-2 rounded-md text-sm font-medium',
                      isActive(item.href)
                        ? 'bg-gold-500/20 text-gold-500'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
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
