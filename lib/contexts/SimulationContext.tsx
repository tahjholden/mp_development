'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UnifiedUser } from '@/lib/db/user-service';

// Enhanced simulation state with additional features
export interface SimulationState {
  // Core simulation state
  isSimulating: boolean;
  simulatedUser: UnifiedUser | null;
  
  // Visual simulation (optional)
  simulatedRole: string;
  enabledFeatures: Record<string, boolean>;
  devToolsOpen: boolean;
  
  // Available users for simulation
  availableUsers: UnifiedUser[];
  
  // Enhanced features
  simulationMetadata: {
    startedAt: Date | null;
    sessionId: string | null;
    source: 'dev-tools' | 'api' | 'url' | null;
  };
  
  // Session persistence
  recentSessions: Array<{
    id: string;
    userId: string;
    userName: string;
    role: string;
    timestamp: Date;
  }>;
  
  // Simulation snapshots
  snapshots: Array<{
    id: string;
    name: string;
    state: Partial<SimulationState>;
    createdAt: Date;
  }>;
}

export interface SimulationContextType {
  // Core simulation
  isSimulating: boolean;
  simulatedUser: UnifiedUser | null;
  availableUsers: UnifiedUser[];
  
  // Visual simulation
  simulatedRole: string;
  enabledFeatures: Record<string, boolean>;
  devToolsOpen: boolean;
  
  // Enhanced features
  simulationMetadata: SimulationState['simulationMetadata'];
  recentSessions: SimulationState['recentSessions'];
  snapshots: SimulationState['snapshots'];
  
  // Core actions
  startSimulation: (user: UnifiedUser, source?: 'dev-tools' | 'api' | 'url') => void;
  stopSimulation: () => void;
  setAvailableUsers: (users: UnifiedUser[]) => void;
  
  // Visual actions
  setSimulatedRole: (role: string) => void;
  toggleFeature: (feature: string) => void;
  setDevToolsOpen: (open: boolean) => void;
  
  // Enhanced actions
  createSnapshot: (name: string) => void;
  loadSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  clearRecentSessions: () => void;
  
  // Helper functions
  getEffectiveUser: () => UnifiedUser | null;
  getEffectiveUserId: () => string | null;
  getEffectiveUserRole: () => string;
  isFeatureEnabled: (feature: string) => boolean;
  getSimulationContext: () => {
    isSimulating: boolean;
    simulatedUserId: string | null;
    simulatedRole: string;
    sessionId: string | null;
  };
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulationState>({
    isSimulating: false,
    simulatedUser: null,
    simulatedRole: 'superadmin',
    enabledFeatures: {
      billing: true,
      playerPortal: true,
      parentPortal: true,
      advancedAnalytics: true,
      aiFeatures: true,
      auditLogs: true,
    },
    devToolsOpen: false,
    availableUsers: [],
    simulationMetadata: {
      startedAt: null,
      sessionId: null,
      source: null,
    },
    recentSessions: [],
    snapshots: [],
  });

  // Load simulation state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('dev-simulation-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          simulatedRole: parsed.simulatedRole || 'superadmin',
          enabledFeatures: parsed.enabledFeatures || prev.enabledFeatures,
          devToolsOpen: parsed.devToolsOpen || false,
          recentSessions: parsed.recentSessions || [],
          snapshots: parsed.snapshots || [],
          // Note: We don't restore isSimulating/simulatedUser from localStorage
          // as they should be fresh for each session
        }));
      } catch (error) {
        console.warn('Failed to restore simulation state:', error);
      }
    }
  }, []);

  // Save simulation state to localStorage
  useEffect(() => {
    const stateToSave = {
      simulatedRole: state.simulatedRole,
      enabledFeatures: state.enabledFeatures,
      devToolsOpen: state.devToolsOpen,
      recentSessions: state.recentSessions,
      snapshots: state.snapshots,
    };
    localStorage.setItem('dev-simulation-state', JSON.stringify(stateToSave));
  }, [state.simulatedRole, state.enabledFeatures, state.devToolsOpen, state.recentSessions, state.snapshots]);

  // Core simulation actions
  const startSimulation = (user: UnifiedUser, source: 'dev-tools' | 'api' | 'url' = 'dev-tools') => {
    const sessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setState(prev => ({
      ...prev,
      isSimulating: true,
      simulatedUser: user,
      simulatedRole: user.primaryRole,
      simulationMetadata: {
        startedAt: new Date(),
        sessionId,
        source,
      },
      recentSessions: [
        {
          id: sessionId,
          userId: user.id,
          userName: user.displayName || `${user.firstName} ${user.lastName}`,
          role: user.primaryRole,
          timestamp: new Date(),
        },
        ...prev.recentSessions.slice(0, 9), // Keep last 10 sessions
      ],
    }));
  };

  const stopSimulation = () => {
    setState(prev => ({
      ...prev,
      isSimulating: false,
      simulatedUser: null,
      simulatedRole: 'superadmin',
      simulationMetadata: {
        startedAt: null,
        sessionId: null,
        source: null,
      },
    }));
  };

  const setAvailableUsers = (users: UnifiedUser[]) => {
    setState(prev => ({ ...prev, availableUsers: users }));
  };

  // Visual simulation actions
  const setSimulatedRole = (role: string) => {
    setState(prev => ({ ...prev, simulatedRole: role }));
  };

  const toggleFeature = (feature: string) => {
    setState(prev => ({
      ...prev,
      enabledFeatures: {
        ...prev.enabledFeatures,
        [feature]: !prev.enabledFeatures[feature],
      },
    }));
  };

  const setDevToolsOpen = (open: boolean) => {
    setState(prev => ({ ...prev, devToolsOpen: open }));
  };

  // Enhanced actions
  const createSnapshot = (name: string) => {
    const snapshotId = `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      snapshots: [
        {
          id: snapshotId,
          name,
          state: {
            simulatedRole: prev.simulatedRole,
            enabledFeatures: prev.enabledFeatures,
          },
          createdAt: new Date(),
        },
        ...prev.snapshots.slice(0, 19), // Keep last 20 snapshots
      ],
    }));
  };

  const loadSnapshot = (snapshotId: string) => {
    const snapshot = state.snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      setState(prev => ({
        ...prev,
        simulatedRole: snapshot.state.simulatedRole || prev.simulatedRole,
        enabledFeatures: snapshot.state.enabledFeatures || prev.enabledFeatures,
      }));
    }
  };

  const deleteSnapshot = (snapshotId: string) => {
    setState(prev => ({
      ...prev,
      snapshots: prev.snapshots.filter(s => s.id !== snapshotId),
    }));
  };

  const clearRecentSessions = () => {
    setState(prev => ({ ...prev, recentSessions: [] }));
  };

  // Helper functions
  const getEffectiveUser = (): UnifiedUser | null => {
    return state.isSimulating ? state.simulatedUser : null;
  };

  const getEffectiveUserId = (): string | null => {
    const user = getEffectiveUser();
    return user?.id || null;
  };

  const getEffectiveUserRole = (): string => {
    if (state.isSimulating && state.simulatedUser) {
      return state.simulatedUser.primaryRole;
    }
    return state.simulatedRole;
  };

  const isFeatureEnabled = (feature: string): boolean => {
    return state.enabledFeatures[feature] || false;
  };

  const getSimulationContext = () => ({
    isSimulating: state.isSimulating,
    simulatedUserId: getEffectiveUserId(),
    simulatedRole: getEffectiveUserRole(),
    sessionId: state.simulationMetadata.sessionId,
  });

  const value: SimulationContextType = {
    // Core simulation
    isSimulating: state.isSimulating,
    simulatedUser: state.simulatedUser,
    availableUsers: state.availableUsers,
    
    // Visual simulation
    simulatedRole: state.simulatedRole,
    enabledFeatures: state.enabledFeatures,
    devToolsOpen: state.devToolsOpen,
    
    // Enhanced features
    simulationMetadata: state.simulationMetadata,
    recentSessions: state.recentSessions,
    snapshots: state.snapshots,
    
    // Actions
    startSimulation,
    stopSimulation,
    setAvailableUsers,
    setSimulatedRole,
    toggleFeature,
    setDevToolsOpen,
    createSnapshot,
    loadSnapshot,
    deleteSnapshot,
    clearRecentSessions,
    
    // Helpers
    getEffectiveUser,
    getEffectiveUserId,
    getEffectiveUserRole,
    isFeatureEnabled,
    getSimulationContext,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

// Convenience hooks for specific simulation aspects
export function useSimulatedUser() {
  const { getEffectiveUser, getEffectiveUserId, getEffectiveUserRole } = useSimulation();
  return {
    user: getEffectiveUser(),
    userId: getEffectiveUserId(),
    role: getEffectiveUserRole(),
  };
}

export function useSimulationFeatures() {
  const { enabledFeatures, isFeatureEnabled, toggleFeature } = useSimulation();
  return {
    features: enabledFeatures,
    isEnabled: isFeatureEnabled,
    toggle: toggleFeature,
  };
}

// Hook to get effective user for API calls
export function useEffectiveUser() {
  const { isSimulating, simulatedUser } = useSimulation();
  return isSimulating ? simulatedUser : null;
}

// Hook to get simulation context for API calls
export function useSimulationContext() {
  const { getSimulationContext } = useSimulation();
  return getSimulationContext();
}

// Hook to check if a feature is enabled
export function useFeatureEnabled(feature: string) {
  const { isFeatureEnabled } = useSimulation();
  return isFeatureEnabled(feature);
}
