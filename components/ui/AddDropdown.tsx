'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  User,
  Users,
  UserCheck,
  UserRound,
  ClipboardList,
} from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { Capability } from '@/lib/db/role-types';

export default function AddDropdown() {
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
      label: 'Add Organization',
      icon: <Users className="h-4 w-4" />,
      href: '/organizations/add',
      capability: Capability.MANAGE_ORGANIZATIONS,
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

  // If no items are available, don't render the dropdown
  if (availableItems.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-[#d8cc97] hover:bg-[#c4b87f] text-black rounded-md px-3 py-2 transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Add New</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-50">
          <div className="py-1">
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
          </div>
        </div>
      )}
    </div>
  );
}
