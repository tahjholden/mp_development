'use client';

import React, { useState } from 'react';
import { Plus, X, User, Users, UserCheck, ClipboardList, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { Capability } from '@/lib/db/role-types';

type ActionItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  capability?: Capability;
};

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { hasCapability } = useUserRole();

  const toggleOpen = () => setIsOpen(!isOpen);

  // Define all possible actions
  const allActions: ActionItem[] = [
    {
      id: 'add-player',
      label: 'Add Player',
      icon: <User className="h-5 w-5" />,
      onClick: () => {
        // Handle add player action
        console.log('Add player clicked');
        // Here you would typically open a modal or navigate to a form
        window.dispatchEvent(new CustomEvent('open-add-player-modal'));
        setIsOpen(false);
      },
      capability: Capability.ADD_PLAYER,
    },
    {
      id: 'add-team',
      label: 'Add Team',
      icon: <Users className="h-5 w-5" />,
      onClick: () => {
        console.log('Add team clicked');
        window.dispatchEvent(new CustomEvent('open-add-team-modal'));
        setIsOpen(false);
      },
      capability: Capability.MANAGE_TEAMS,
    },
    {
      id: 'add-coach',
      label: 'Add Coach',
      icon: <UserRound className="h-5 w-5" />,
      onClick: () => {
        console.log('Add coach clicked');
        window.dispatchEvent(new CustomEvent('open-add-coach-modal'));
        setIsOpen(false);
      },
      capability: Capability.MANAGE_COACHES,
    },
    {
      id: 'add-observation',
      label: 'Add Observation',
      icon: <ClipboardList className="h-5 w-5" />,
      onClick: () => {
        console.log('Add observation clicked');
        // Navigate to the observation wizard
        window.location.href = '/observations/wizard';
        setIsOpen(false);
      },
      capability: Capability.ADD_OBSERVATION,
    },
    {
      id: 'add-parent',
      label: 'Add Parent',
      icon: <UserCheck className="h-5 w-5" />,
      onClick: () => {
        console.log('Add parent clicked');
        window.dispatchEvent(new CustomEvent('open-add-parent-modal'));
        setIsOpen(false);
      },
      capability: Capability.ADD_PLAYER, // Assuming parent management is tied to player management
    },
  ];

  // Filter actions based on user capabilities
  const availableActions = allActions.filter(
    action => !action.capability || hasCapability(action.capability)
  );

  // If no actions are available based on permissions, don't render the FAB
  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Backdrop when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-2 flex flex-col-reverse items-end space-y-2 space-y-reverse">
            {availableActions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { delay: index * 0.05 } 
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20, 
                  scale: 0.8,
                  transition: { delay: (availableActions.length - index - 1) * 0.05 } 
                }}
                onClick={action.onClick}
                className="flex items-center mb-2 bg-zinc-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-zinc-700 transition-colors"
              >
                <span className="mr-2">{action.label}</span>
                <div className="p-2 rounded-full bg-[#d8cc97]/20">
                  {action.icon}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <button
        onClick={toggleOpen}
        className={cn(
          "p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
          isOpen 
            ? "bg-zinc-700 rotate-45" 
            : "bg-[#d8cc97] hover:bg-[#c4b87f]"
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-black" />
        )}
      </button>
    </div>
  );
}