// Simulation SDK Usage Examples
// Demonstrates how to use the enhanced simulation system

import { 
  useSimulation, 
  useSimulatedUser, 
  useSimulationAwareFetch,
  useFeatureEnabled 
} from '@/lib/contexts/SimulationContext';
import { simulationAwareFetch } from '@/lib/simulation-api';

// Example 1: Basic simulation usage in a component
export function ExampleComponent() {
  const { isSimulating, simulatedUser, startSimulation, stopSimulation } = useSimulation();
  const { user, userId, role } = useSimulatedUser();
  const { fetch: simulationFetch } = useSimulationAwareFetch();
  const isBillingEnabled = useFeatureEnabled('billing');

  const handleSimulateUser = async (userId: string) => {
    // This would typically fetch user data from your API
    const userData = { id: userId, firstName: 'John', lastName: 'Doe', primaryRole: 'coach' };
    startSimulation(userData);
  };

  const handleApiCall = async () => {
    // This automatically includes simulation metadata
    const response = await simulationFetch('/api/users', {
      method: 'GET',
    });
    return response.json();
  };

  return (
    <div>
      {isSimulating ? (
        <div>
          <p>Simulating as: {user?.firstName} {user?.lastName}</p>
          <p>Role: {role}</p>
          <p>User ID: {userId}</p>
          <button onClick={stopSimulation}>Exit Simulation</button>
        </div>
      ) : (
        <button onClick={() => handleSimulateUser('user-123')}>
          Start Simulation
        </button>
      )}
      
      {isBillingEnabled && <p>Billing features are enabled</p>}
    </div>
  );
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
  const response = await simulationAwareFetch('/api/observations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: 'player-456', notes: 'Test observation' }),
  }, simulationContext);

  return response.json();
}

// Example 3: Feature-gated component
export function FeatureGatedComponent() {
  const isPlayerPortalEnabled = useFeatureEnabled('playerPortal');
  const isParentPortalEnabled = useFeatureEnabled('parentPortal');

  if (!isPlayerPortalEnabled) {
    return <div>Player portal is not available</div>;
  }

  return (
    <div>
      <h2>Player Portal</h2>
      {isParentPortalEnabled && (
        <div>Parent portal integration is available</div>
      )}
    </div>
  );
}

// Example 4: Simulation-aware data fetching
export function useSimulationAwareData<T>(url: string) {
  const { fetch: simulationFetch } = useSimulationAwareFetch();
  const { isSimulating, simulatedUser } = useSimulation();

  const fetchData = async (): Promise<T> => {
    const response = await simulationFetch(url);
    
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