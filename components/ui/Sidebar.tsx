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
  Calendar,
  BarChart3,
  BookOpen,
  CreditCard,
  Shield,
  UserCheck,
  Beaker,
} from 'lucide-react';
import UniversalButton from './UniversalButton';
import { useUserRole } from '@/lib/hooks/useUserRole';

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

const getNavItems = (uiConfig: any): NavItemType[] => {
  const baseItems: NavItemType[] = [];

  // Always show dashboard
  baseItems.push({
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  });

  // Show players section if user has access
  if (uiConfig.showPlayers) {
    baseItems.push({
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
    });
  }

  // Show teams if user has access
  if (uiConfig.showTeams) {
    baseItems.push({
      title: 'Teams',
      href: '/teams',
      icon: <Users size={20} />,
    });
  }

  // Show coaches if user has access
  if (uiConfig.showCoaches) {
    baseItems.push({
      title: 'Coaches',
      href: '/coaches',
      icon: <UserRound size={20} />,
    });
  }

  // Show observations if user has access
  if (uiConfig.showObservations) {
    baseItems.push({
      title: 'Observations',
      href: '/observations',
      icon: <ClipboardList size={20} />,
    });
  }

  // Show sessions
  baseItems.push({
    title: 'Sessions',
    href: '/sessions',
    icon: <Calendar size={20} />,
  });

  // Show drills
  baseItems.push({
    title: 'Drills',
    href: '/drills',
    icon: <ClipboardList size={20} />,
  });

  // Show analytics
  baseItems.push({
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 size={20} />,
  });

  // Show player portal
  baseItems.push({
    title: 'Player Portal',
    href: '/player',
    icon: <UserCheck size={20} />,
  });

  // Show parent portal
  baseItems.push({
    title: 'Parent Portal',
    href: '/parent',
    icon: <Users size={20} />,
  });

  // Show billing
  baseItems.push({
    title: 'Billing',
    href: '/billing',
    icon: <CreditCard size={20} />,
  });

  // Show AI features
  baseItems.push({
    title: 'AI Features',
    href: '/ai-features',
    icon: <Shield size={20} />,
  });

  // Show audit logs if user has admin access
  if (uiConfig.showAdmin) {
    baseItems.push({
      title: 'Audit Logs',
      href: '/audit-logs',
      icon: <Shield size={20} />,
    });
  }

  // Show resources
  baseItems.push({
    title: 'Resources',
    href: '/resources',
    icon: <BookOpen size={20} />,
  });

  // Show settings if user has access
  if (uiConfig.showSettings) {
    baseItems.push({
      title: 'Settings',
      href: '/settings',
      icon: <Settings size={20} />,
    });
  }

  // Superadmin-only dev links
  if (uiConfig.showAdmin) {
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Use the role-based hook for navigation
  const { user: roleUser, isLoading } = useUserRole();

  // KISS: Only use personType for role logic
  const isSuperAdmin = roleUser?.personType === 'superadmin';

  // Literal, hardcoded SuperAdmin nav
  const superAdminNav: NavItemType[] = [
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
      title: 'Player Portal',
      href: '/player',
      icon: <UserCheck size={20} />,
    },
    {
      title: 'Parent Portal',
      href: '/parent',
      icon: <Users size={20} />,
    },
    {
      title: 'Billing',
      href: '/billing',
      icon: <CreditCard size={20} />,
    },
    {
      title: 'AI Features',
      href: '/ai-features',
      icon: <Shield size={20} />,
    },
    {
      title: 'Audit Logs',
      href: '/audit-logs',
      icon: <Shield size={20} />,
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
    {
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
    },
  ];

  // For all other roles, use a minimal literal nav (KISS)
  let navItems: NavItemType[] = [];
  if (isSuperAdmin) {
    navItems = superAdminNav;
  } else if (roleUser?.personType === 'admin') {
    navItems = superAdminNav.filter(item => item.title !== '🛠️ Dev Tools');
  } else if (roleUser?.personType === 'coach') {
    navItems = [
      superAdminNav[0], // Dashboard
      superAdminNav[1], // Players
      superAdminNav[2], // Teams
      superAdminNav[3], // Coaches
      superAdminNav[4], // Sessions
      superAdminNav[5], // Drills
      superAdminNav[6], // Analytics
      superAdminNav[7], // Player Portal
    ];
  } else if (roleUser?.personType === 'player') {
    navItems = [
      superAdminNav[0], // Dashboard
      superAdminNav[1], // Players (for Observations submenu)
      superAdminNav[7], // Player Portal
      superAdminNav[4], // Sessions
      superAdminNav[5], // Drills
    ];
  } else if (roleUser?.personType === 'parent') {
    navItems = [
      superAdminNav[0], // Dashboard
      superAdminNav[1], // Players (for Observations submenu)
      superAdminNav[8], // Parent Portal
      superAdminNav[4], // Sessions
      superAdminNav[5], // Drills
    ];
  } else {
    navItems = [superAdminNav[0]]; // Dashboard only
  }

  // Close mobile sidebar when pathname changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Pre-expand the item that contains the current path
  useEffect(() => {
    const itemsToExpand: Record<string, boolean> = {};
    
    navItems.forEach((item: NavItemType) => {
      if (item.children) {
        const shouldExpand = item.children.some((child: NavItemType) =>
          pathname.startsWith(child.href)
        );
        if (shouldExpand) {
          itemsToExpand[item.title] = true;
        }
      }
    });
    
    // Only update state once with all items that need to be expanded
    if (Object.keys(itemsToExpand).length > 0) {
      setExpandedItems(prev => ({ ...prev, ...itemsToExpand }));
    }
  }, [pathname]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Show loading state if role data is still loading
  if (isLoading) {
    return (
      <aside className="fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-zinc-900 border-r border-zinc-800 w-64">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#d8cc97]"></div>
        </div>
      </aside>
    );
  }

  // Debug log for diagnosis
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[Sidebar DEBUG]', {
      personType: roleUser?.personType,
      navItems,
    });
  }

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
          'fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ease-in-out',
          'w-64 md:w-64 md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Navigation */}
        <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-8rem)]">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        'text-zinc-300 hover:text-white hover:bg-zinc-800',
                        expandedItems[item.title] && 'bg-zinc-800 text-white'
                      )}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </div>
                      {expandedItems[item.title] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {expandedItems[item.title] && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {item.children.map(child => (
                          <li key={child.title}>
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                                isActive(child.href)
                                  ? 'bg-[#d8cc97] text-black'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              )}
                            >
                              {child.icon}
                              <span className="ml-3">{child.title}</span>
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
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive(item.href)
                        ? 'bg-[#d8cc97] text-black'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#d8cc97] rounded-full flex items-center justify-center">
                <span className="text-black text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-zinc-400">{user?.email}</p>
              </div>
            </div>
            {onSignOut && (
              <UniversalButton.Ghost
                onClick={onSignOut}
                size="sm"
                className="text-zinc-400 hover:text-white"
              >
                <LogOut size={16} />
              </UniversalButton.Ghost>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
