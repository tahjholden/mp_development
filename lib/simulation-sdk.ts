// Simulation SDK - Comprehensive simulation system for development and testing
// Provides simulation-aware API calls, context management, and developer tools

// Core simulation context and hooks
export {
  SimulationProvider,
  useSimulation,
  useSimulatedUser,
  useSimulationFeatures,
  useEffectiveUser,
  useSimulationContext,
  useFeatureEnabled,
} from '@/lib/contexts/SimulationContext';

// Simulation-aware API client
export {
  simulationAwareFetch,
  useSimulationAwareFetch,
  createSimulationAwareRequest,
  SimulationAwareApiClient,
  useSimulationAwareApiClient,
  simulationDebug,
} from '@/lib/simulation-api';

// Simulation UI components
export {
  SimulationBanner,
  SimulationBannerCompact,
  SimulationIndicator,
} from '@/components/ui/SimulationBanner';

// Types and interfaces
export type {
  SimulationState,
  SimulationContextType,
} from '@/lib/contexts/SimulationContext';

export type {
  SimulationMetadata,
  SimulationAwareRequest,
} from '@/lib/simulation-api';

// Utility functions for simulation management
export const simulationUtils = {
  // Generate simulation session ID
  generateSessionId: (): string => {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Generate snapshot ID
  generateSnapshotId: (): string => {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format simulation duration
  formatDuration: (startTime: Date): string => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  // Create simulation metadata
  createSimulationMetadata: (
    isSimulating: boolean,
    simulatedUserId: string | null,
    simulatedRole: string,
    sessionId: string | null
  ) => ({
    isSimulating,
    simulatedUserId,
    simulatedRole,
    sessionId,
    timestamp: new Date().toISOString(),
  }),

  // Validate simulation state
  validateSimulationState: (state: any): boolean => {
    if (state.isSimulating) {
      return !!(state.simulatedUser && state.simulationMetadata?.sessionId);
    }
    return true;
  },

  // Create simulation report
  createSimulationReport: (
    context: any,
    requestCount: number = 0,
    additionalData: Record<string, any> = {}
  ) => ({
    isSimulating: context.isSimulating,
    simulatedUserId: context.simulatedUserId,
    simulatedRole: context.simulatedRole,
    sessionId: context.sessionId,
    timestamp: context.timestamp,
    requestCount,
    duration: context.isSimulating && context.timestamp ? 
      Date.now() - new Date(context.timestamp).getTime() : 0,
    ...additionalData,
  }),
};

// Higher-order component for simulation-aware components
export function withSimulation<T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: T) => (
    <Component {...props} />
  );
}

// Simulation-aware wrapper for API calls
export function withSimulationContext<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    // This would be enhanced with actual simulation context injection
    // For now, it's a placeholder for the pattern
    return fn(...args);
  };
}

// Simulation debugging utilities
export const simulationDebugUtils = {
  // Log simulation state
  logState: (context: any, label: string = 'Simulation State') => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🎭 ${label}`);
      console.log('Active:', context.isSimulating);
      console.log('User ID:', context.simulatedUserId);
      console.log('Role:', context.simulatedRole);
      console.log('Session ID:', context.sessionId);
      console.log('Timestamp:', context.timestamp);
      console.groupEnd();
    }
  },

  // Log simulation request
  logRequest: (request: any, response?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Simulation Request');
      console.log('Request:', request);
      if (response) {
        console.log('Response:', response);
      }
      console.groupEnd();
    }
  },

  // Create simulation performance report
  createPerformanceReport: (context: any, metrics: Record<string, number>) => {
    return {
      simulation: {
        isActive: context.isSimulating,
        duration: context.isSimulating && context.timestamp ? 
          Date.now() - new Date(context.timestamp).getTime() : 0,
        sessionId: context.sessionId,
      },
      metrics,
      timestamp: new Date().toISOString(),
    };
  },
};

// Default export for easy importing
const SimulationSDK = {
  // Core
  SimulationProvider,
  useSimulation,
  useSimulatedUser,
  useEffectiveUser,
  
  // API
  simulationAwareFetch,
  useSimulationAwareFetch,
  SimulationAwareApiClient,
  
  // UI
  SimulationBanner,
  SimulationIndicator,
  
  // Utils
  simulationUtils,
  simulationDebugUtils,
  
  // HOCs
  withSimulation,
  withSimulationContext,
};

export default SimulationSDK; 