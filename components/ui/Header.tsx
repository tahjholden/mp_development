import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  Plus, 
  ChevronRight, 
  X,
  UserPlus,
  CalendarPlus,
  ClipboardPlus,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UniversalButton from './UniversalButton';
import UniversalCard from './UniversalCard';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showQuickActions?: boolean;
  showNotifications?: boolean;
  showBreadcrumbs?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

// Map of path segments to readable names
const pathNames: Record<string, string> = {
  dashboard: 'Dashboard',
  players: 'Players',
  teams: 'Teams',
  coaches: 'Coaches',
  sessions: 'Sessions',
  drills: 'Drills',
  analytics: 'Analytics',
  settings: 'Settings',
  development: 'Development Plans',
  observations: 'Observations',
  profile: 'Profile',
};

export function Header({
  title,
  showSearch = true,
  showQuickActions = true,
  showNotifications = true,
  showBreadcrumbs = true,
  onSearch,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  
  // Generate breadcrumbs from the current path
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    return (
      <div className="flex items-center text-sm">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        
        {paths.map((path, index) => {
          // Build the URL for this breadcrumb
          const url = `/${paths.slice(0, index + 1).join('/')}`;
          const isLast = index === paths.length - 1;
          
          // Get a readable name for this path segment
          const name = pathNames[path] || path.charAt(0).toUpperCase() + path.slice(1);
          
          return (
            <React.Fragment key={url}>
              <ChevronRight size={16} className="mx-2 text-zinc-600" />
              {isLast ? (
                <span className="font-medium text-gold-500">{name}</span>
              ) : (
                <Link href={url} className="text-zinc-400 hover:text-white">
                  {name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className={cn("bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30", className)}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Title and Breadcrumbs */}
          <div className="flex items-center">
            {/* Spacer for mobile sidebar toggle */}
            <div className="w-8 h-8 md:hidden"></div>
            
            <div className="ml-4 md:ml-0">
              {title && <h1 className="text-lg font-semibold text-white">{title}</h1>}
              {showBreadcrumbs && generateBreadcrumbs()}
            </div>
          </div>

          {/* Right side - Search, Quick Actions, Notifications */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search - Desktop */}
            {showSearch && (
              <div className="hidden md:block relative">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search 
                      size={18} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" 
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-zinc-800 text-white rounded-md pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:bg-zinc-700"
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Search - Mobile */}
            {showSearch && (
              <div className="md:hidden">
                {showSearchMobile ? (
                  <div className="fixed inset-0 z-50 bg-zinc-900/90 flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                      <div className="flex items-center mb-4">
                        <h2 className="text-lg font-medium text-white flex-1">Search</h2>
                        <button 
                          onClick={() => setShowSearchMobile(false)}
                          className="p-2 rounded-full hover:bg-zinc-800"
                        >
                          <X size={20} className="text-zinc-400" />
                        </button>
                      </div>
                      <form onSubmit={handleSearch} className="relative">
                        <Search 
                          size={18} 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" 
                        />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-zinc-800 text-white rounded-md pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:bg-zinc-700"
                          autoFocus
                        />
                      </form>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowSearchMobile(true)}
                    className="p-2 rounded-full hover:bg-zinc-800"
                  >
                    <Search size={20} className="text-zinc-400" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <div className="relative">
                <UniversalButton.Secondary 
                  onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  className="hidden md:flex"
                >
                  Quick Action
                </UniversalButton.Secondary>
                
                <UniversalButton.Ghost
                  onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
                  size="sm"
                  className="md:hidden"
                >
                  <Plus size={20} className="text-gold-500" />
                </UniversalButton.Ghost>
                
                {showQuickActionsMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowQuickActionsMenu(false)}
                    />
                    <UniversalCard.Elevated 
                      className="absolute right-0 mt-2 w-56 z-50"
                      size="sm"
                    >
                      <div className="py-1">
                        <Link 
                          href="/players/add" 
                          className="flex items-center px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-white"
                          onClick={() => setShowQuickActionsMenu(false)}
                        >
                          <UserPlus size={16} className="mr-2 text-gold-500" />
                          Add Player
                        </Link>
                        <Link 
                          href="/sessions/add" 
                          className="flex items-center px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-white"
                          onClick={() => setShowQuickActionsMenu(false)}
                        >
                          <CalendarPlus size={16} className="mr-2 text-gold-500" />
                          New Session
                        </Link>
                        <Link 
                          href="/drills/add" 
                          className="flex items-center px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-white"
                          onClick={() => setShowQuickActionsMenu(false)}
                        >
                          <ClipboardPlus size={16} className="mr-2 text-gold-500" />
                          Add Drill
                        </Link>
                        <hr className="my-1 border-zinc-800" />
                        <Link 
                          href="/settings" 
                          className="flex items-center px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-white"
                          onClick={() => setShowQuickActionsMenu(false)}
                        >
                          <Settings size={16} className="mr-2 text-zinc-400" />
                          Settings
                        </Link>
                      </div>
                    </UniversalCard.Elevated>
                  </>
                )}
              </div>
            )}

            {/* Notifications */}
            {showNotifications && (
              <button className="p-2 rounded-full hover:bg-zinc-800 relative">
                <Bell size={20} className="text-zinc-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
