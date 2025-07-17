'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  User,
  Users,
  UserCheck,
  UserRound,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { Capability } from '@/lib/db/role-types';

interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onSignOut?: () => void;
}

export default function UserDropdown({ user, onSignOut }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { hasCapability } = useUserRole();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Define dropdown items based on user capabilities
  const dropdownItems = [
    {
      label: 'Add Player',
      icon: <User className="h-4 w-4" />,
      href: '/players/add',
      capability: Capability.ADD_PLAYER,
    },
    {
      label: 'Add Team',
      icon: <Users className="h-4 w-4" />,
      href: '/teams/add',
      capability: Capability.MANAGE_TEAMS,
    },
    {
      label: 'Add Coach',
      icon: <UserRound className="h-4 w-4" />,
      href: '/coaches/add',
      capability: Capability.MANAGE_COACHES,
    },
    {
      label: 'Add Observation',
      icon: <ClipboardList className="h-4 w-4" />,
      href: '/observations/wizard',
      capability: Capability.ADD_OBSERVATION,
    },
    {
      label: 'Add Parent',
      icon: <UserCheck className="h-4 w-4" />,
      href: '/parents/add',
      capability: Capability.ADD_PLAYER, // Assuming parent management is tied to player management
    },
  ];

  // Filter items based on user capabilities
  const availableItems = dropdownItems.filter(
    item => !item.capability || hasCapability(item.capability)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User info and dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-transparent hover:bg-zinc-800 rounded-md px-3 py-2 transition-colors"
      >
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">
            {user.name}
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            {user.email}
          </span>
          <span className="text-xs text-white leading-tight capitalize">
            {user.role}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-50">
          <div className="py-1">
            {/* Add actions section */}
            {availableItems.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Add New
                </div>
                {availableItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-2 text-[#d8cc97]">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-zinc-800 my-1"></div>
              </>
            )}

            {/* Sign out option */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (onSignOut) onSignOut();
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2 text-zinc-400" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
