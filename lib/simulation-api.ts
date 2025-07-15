// Simulation-aware API client
// Automatically tags requests with simulation metadata and provides enhanced debugging

import { useSimulationContext } from '@/lib/contexts/SimulationContext';

// Type for fetch options
type RequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  [key: string]: any;
};

export interface SimulationMetadata {
  isSimulating: boolean;
  simulatedUserId: string | null;
  simulatedRole: string;
  sessionId: string | null;
  timestamp: string;
}

export interface SimulationAwareRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  simulationMetadata: SimulationMetadata;
}

// Enhanced fetch function that includes simulation metadata
export async function simulationAwareFetch(
  url: string,
  options: any = {},
  simulationContext: SimulationMetadata
): Promise<Response> {
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-Simulation-Active': simulationContext.isSimulating ? 'true' : 'false',
      'X-Simulation-User-Id': simulationContext.simulatedUserId || '',
      'X-Simulation-Role': simulationContext.simulatedRole,
      'X-Simulation-Session-Id': simulationContext.sessionId || '',
      'X-Simulation-Timestamp': simulationContext.timestamp,
    },
  };

  // Log simulation-aware requests in development
  if (process.env.NODE_ENV === 'development') {
    console.group(
      `🔍 Simulation API Request: ${options.method || 'GET'} ${url}`
    );
    console.log('Simulation Context:', simulationContext);
    console.log('Enhanced Headers:', enhancedOptions.headers);
    console.groupEnd();
  }

  return fetch(url, enhancedOptions);
}

// Hook for making simulation-aware API calls
export function useSimulationAwareFetch() {
  const simulationContext = useSimulationContext();

  const fetchWithSimulation = async (
    url: string,
    options: any = {}
  ): Promise<Response> => {
    const metadata: SimulationMetadata = {
      ...simulationContext,
      timestamp: new Date().toISOString(),
    };

    return simulationAwareFetch(url, options, metadata);
  };

  return { fetch: fetchWithSimulation, simulationContext };
}

// Utility to create simulation-aware request objects
export function createSimulationAwareRequest(
  url: string,
  method: string,
  body?: any,
  simulationContext?: SimulationMetadata
): SimulationAwareRequest {
  const context = simulationContext || {
    isSimulating: false,
    simulatedUserId: null,
    simulatedRole: 'superadmin',
    sessionId: null,
    timestamp: new Date().toISOString(),
  };

  return {
    url,
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Simulation-Active': context.isSimulating ? 'true' : 'false',
      'X-Simulation-User-Id': context.simulatedUserId || '',
      'X-Simulation-Role': context.simulatedRole,
      'X-Simulation-Session-Id': context.sessionId || '',
      'X-Simulation-Timestamp': context.timestamp,
    },
    body,
    simulationMetadata: context,
  };
}

// Simulation-aware API client class
export class SimulationAwareApiClient {
  private baseUrl: string;
  private simulationContext: SimulationMetadata;

  constructor(baseUrl: string, simulationContext: SimulationMetadata) {
    this.baseUrl = baseUrl;
    this.simulationContext = simulationContext;
  }

  private async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await simulationAwareFetch(
      url,
      options,
      this.simulationContext
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Update simulation context
  updateSimulationContext(context: SimulationMetadata) {
    this.simulationContext = context;
  }
}

// Hook to create a simulation-aware API client
export function useSimulationAwareApiClient(baseUrl: string) {
  const simulationContext = useSimulationContext();

  const metadata: SimulationMetadata = {
    ...simulationContext,
    timestamp: new Date().toISOString(),
  };

  return new SimulationAwareApiClient(baseUrl, metadata);
}

// Utility functions for simulation debugging
export const simulationDebug = {
  // Log simulation state for debugging
  logSimulationState(context: SimulationMetadata) {
    if (process.env.NODE_ENV === 'development') {
      console.group('🎭 Simulation State');
      console.log('Active:', context.isSimulating);
      console.log('User ID:', context.simulatedUserId);
      console.log('Role:', context.simulatedRole);
      console.log('Session ID:', context.sessionId);
      console.log('Timestamp:', context.timestamp);
      console.groupEnd();
    }
  },

  // Create simulation report
  createSimulationReport(
    context: SimulationMetadata,
    requestCount: number = 0
  ) {
    return {
      isSimulating: context.isSimulating,
      simulatedUserId: context.simulatedUserId,
      simulatedRole: context.simulatedRole,
      sessionId: context.sessionId,
      timestamp: context.timestamp,
      requestCount,
      duration: context.isSimulating
        ? Date.now() - new Date(context.timestamp).getTime()
        : 0,
    };
  },

  // Validate simulation context
  validateSimulationContext(context: SimulationMetadata): boolean {
    if (context.isSimulating) {
      return !!(context.simulatedUserId && context.sessionId);
    }
    return true;
  },
};
