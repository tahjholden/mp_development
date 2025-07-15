'use client';

import React from 'react';
import { useSimulation } from '@/lib/contexts/SimulationContext';
import { X, User, Clock, Settings } from 'lucide-react';
import UniversalButton from '@/components/ui/UniversalButton';
import { colors } from '@/lib/design-tokens';

export function SimulationBanner() {
  const {
    isSimulating,
    simulatedUser,
    simulationMetadata,
    stopSimulation,
    setDevToolsOpen,
  } = useSimulation();

  if (!isSimulating || !simulatedUser) {
    return null;
  }

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 p-3 shadow-lg"
      style={{
        backgroundColor: colors.danger[500],
        borderBottom: `2px solid ${colors.danger[600]}`,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Simulation Icon */}
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">SIMULATION ACTIVE</span>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-white">
              <span className="font-medium">
                {simulatedUser.displayName ||
                  `${simulatedUser.firstName} ${simulatedUser.lastName}`}
              </span>
              <span className="text-sm opacity-90 ml-2">
                ({simulatedUser.primaryRole})
              </span>
            </div>
          </div>

          {/* Session Info */}
          {simulationMetadata.startedAt && (
            <div className="flex items-center space-x-1 text-white opacity-90">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {formatDuration(simulationMetadata.startedAt)}
              </span>
            </div>
          )}

          {/* Session ID */}
          {simulationMetadata.sessionId && (
            <div className="text-white opacity-75">
              <span className="text-xs font-mono">
                {simulationMetadata.sessionId.slice(-8)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Dev Tools Button */}
          <UniversalButton.Ghost
            onClick={() => setDevToolsOpen(true)}
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4 mr-1" />
            Dev Tools
          </UniversalButton.Ghost>

          {/* Stop Simulation Button */}
          <UniversalButton.Danger onClick={stopSimulation} size="sm">
            <X className="h-4 w-4 mr-1" />
            Exit Simulation
          </UniversalButton.Danger>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller screens
export function SimulationBannerCompact() {
  const { isSimulating, simulatedUser, stopSimulation } = useSimulation();

  if (!isSimulating || !simulatedUser) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 p-2 shadow-lg"
      style={{
        backgroundColor: colors.danger[500],
        borderBottom: `2px solid ${colors.danger[600]}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-white" />
          <span className="text-white text-sm font-medium">
            SIM:{' '}
            {simulatedUser.displayName ||
              `${simulatedUser.firstName} ${simulatedUser.lastName}`}
          </span>
        </div>

        <UniversalButton.Danger onClick={stopSimulation} size="xs">
          <X className="h-3 w-3" />
        </UniversalButton.Danger>
      </div>
    </div>
  );
}

// Floating simulation indicator
export function SimulationIndicator() {
  const { isSimulating, simulatedUser, stopSimulation } = useSimulation();

  if (!isSimulating || !simulatedUser) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      style={{
        backgroundColor: colors.danger[500],
        border: `2px solid ${colors.danger[600]}`,
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      onClick={stopSimulation}
      title={`Exit simulation as ${simulatedUser.displayName || `${simulatedUser.firstName} ${simulatedUser.lastName}`}`}
    >
      <User className="h-6 w-6 text-white" />
    </div>
  );
}
