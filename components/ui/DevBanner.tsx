'use client';

import React from 'react';
import { AlertTriangle, Eye, Play, Square } from 'lucide-react';
import { useSimulation } from '@/lib/contexts/SimulationContext';

export default function DevBanner() {
  const {
    simulatedRole,
    enabledFeatures,
    isSimulating,
    simulatedUser,
    stopSimulation,
  } = useSimulation();

  // Don't show banner if no simulation is active
  if (!isSimulating && simulatedRole === 'superadmin') {
    return null;
  }

  const enabledFeaturesList = Object.entries(enabledFeatures)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature)
    .join(', ');

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-sm">Development Mode</span>
          </div>

          {/* Functional Simulation Status */}
          {isSimulating && simulatedUser ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-green-300" />
                <span className="text-sm">
                  Simulating as{' '}
                  <strong>
                    {simulatedUser.displayName ||
                      `${simulatedUser.firstName} ${simulatedUser.lastName}`}
                  </strong>{' '}
                  ({simulatedUser.email})
                </span>
              </div>
              <span className="text-xs bg-green-600 px-2 py-1 rounded">
                {simulatedUser.primaryRole}
              </span>
              <button
                onClick={stopSimulation}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                <Square className="h-3 w-3" />
                <span>Exit Simulation</span>
              </button>
            </div>
          ) : (
            /* Visual Simulation Status */
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-blue-300" />
                <span className="text-sm">
                  Viewing as <strong>{simulatedRole}</strong>
                </span>
              </div>
              {enabledFeaturesList && (
                <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                  Features: {enabledFeaturesList}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs opacity-75">
            {isSimulating
              ? 'Functional Simulation Active'
              : 'Visual Simulation Active'}
          </span>
        </div>
      </div>
    </div>
  );
}
