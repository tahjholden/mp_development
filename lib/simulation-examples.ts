// Simulation SDK Usage Examples
// Demonstrates how to use the enhanced simulation system

import {
  useSimulation,
  useSimulatedUser,
  useFeatureEnabled,
} from '@/lib/contexts/SimulationContext';
import { simulationAwareFetch } from '@/lib/simulation-api';
import { PersonType } from '@/lib/db/role-logic';

// Example 1: Basic simulation usage in a component
export function ExampleComponent() {
  const { isSimulating, startSimulation, stopSimulation } = useSimulation();
  const { userId, role } = useSimulatedUser();
  const isBillingEnabled = useFeatureEnabled('billing');

  const handleSimulateUser = async (userId: string) => {
    // This would typically fetch user data from your API
    // Note: In a real implementation, you would fetch the full UnifiedUser object
    const userData = {
      id: userId,
      authUid: `auth_${userId}`,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      primaryRole: PersonType.COACH,
      organizationId: 'org_123',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      displayName: 'John Doe',
      isAdmin: false,
      isSuperadmin: false,
      roles: ['coach'],
      basketballRoles: [],
    };
    startSimulation(userData);
  };

  const handleApiCall = async () => {
    // This would use the simulation-aware fetch from simulation-api.ts
    const response = await fetch('/api/users', {
      method: 'GET',
    });
    return response.json();
  };

  // Note: This is a TypeScript example - in a real React component, you would return JSX
  return {
    isSimulating,
    role,
    userId,
    isBillingEnabled,
    handleSimulateUser,
    handleApiCall,
    stopSimulation,
  };
}

// Example 2: API client usage
export async function exampleApiUsage() {
  const simulationContext = {
    isSimulating: true,
    simulatedUserId: 'user-123',
    simulatedRole: 'coach',
    sessionId: 'sim_1234567890_abc123',
    timestamp: new Date().toISOString(),
  };

  // Make simulation-aware API call
  const response = await simulationAwareFetch(
    '/api/observations',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 'player-456',
        notes: 'Test observation',
      }),
    },
    simulationContext
  );

  return response.json();
}

// Example 3: Feature-gated component
export function FeatureGatedComponent() {
  const isPlayerPortalEnabled = useFeatureEnabled('playerPortal');
  const isParentPortalEnabled = useFeatureEnabled('parentPortal');

  // Note: This is a TypeScript example - in a real React component, you would return JSX
  return {
    isPlayerPortalEnabled,
    isParentPortalEnabled,
    shouldShowPlayerPortal: isPlayerPortalEnabled,
    shouldShowParentPortal: isParentPortalEnabled,
  };
}

// Example 4: Simulation-aware data fetching
export function useSimulationAwareData<T>(url: string) {
  const { isSimulating, simulatedUser } = useSimulation();

  const fetchData = async (): Promise<T> => {
    const response = await fetch(url);

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Simulation-aware request:', {
        url,
        isSimulating,
        simulatedUser: simulatedUser?.id,
        response: await response.clone().json(),
      });
    }

    return response.json();
  };

  return { fetchData, isSimulating };
}

// Example 5: Simulation metadata in server actions
export async function simulationAwareServerAction(
  formData: FormData,
  simulationContext?: {
    isSimulating: boolean;
    simulatedUserId: string | null;
    simulatedRole: string;
    sessionId: string | null;
  }
) {
  // Add simulation metadata to the action
  const metadata = {
    ...simulationContext,
    timestamp: new Date().toISOString(),
    action: 'create_observation',
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('🎭 Server Action with Simulation:', metadata);
  }

  // Your server action logic here
  const observation = {
    playerId: formData.get('playerId'),
    notes: formData.get('notes'),
    createdBy: simulationContext?.simulatedUserId || 'authenticated-user',
    simulationMetadata: metadata,
  };

  return observation;
}

// Example 6: Simulation debugging utilities
export function useSimulationDebug() {
  const simulation = useSimulation();

  const logSimulationState = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🎭 Simulation Debug Info');
      console.log('Is Simulating:', simulation.isSimulating);
      console.log('Simulated User:', simulation.simulatedUser);
      console.log('Simulated Role:', simulation.simulatedRole);
      console.log('Enabled Features:', simulation.enabledFeatures);
      console.log('Session Metadata:', simulation.simulationMetadata);
      console.groupEnd();
    }
  };

  const createSimulationReport = () => {
    return {
      isSimulating: simulation.isSimulating,
      simulatedUser: simulation.simulatedUser?.id,
      simulatedRole: simulation.simulatedRole,
      enabledFeatures: simulation.enabledFeatures,
      sessionId: simulation.simulationMetadata.sessionId,
      startedAt: simulation.simulationMetadata.startedAt,
      timestamp: new Date().toISOString(),
    };
  };

  return { logSimulationState, createSimulationReport };
}
