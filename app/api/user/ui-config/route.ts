import { getCurrentUser } from '@/lib/db/user-service';

export async function GET() {
  try {
    // Try to get the user from our custom session first
    const currentUser = await getCurrentUser();
    
    // Use mock user for development if no user is found (matching behavior in /api/user)
    let personType;
    if (!currentUser) {
      // For development, use mock superadmin user type
      personType = 'superadmin';
    } else {
      personType = currentUser.personType;
    }

    // KISS: UI config based only on personType
    let uiConfig;
    switch (personType) {
      case 'superadmin':
        uiConfig = {
          showDashboard: true,
          showPlayers: true,
          showTeams: true,
          showCoaches: true,
          showObservations: true,
          showSettings: true,
          showAdmin: true,
          navigationItems: [
            'dashboard',
            'players',
            'teams',
            'coaches',
            'observations',
            'sessions',
            'drills',
            'analytics',
            'player-portal',
            'parent-portal',
            'billing',
            'ai-features',
            'audit-logs',
            'resources',
            'settings',
            'admin',
          ],
        };
        break;
      case 'admin':
        uiConfig = {
          showDashboard: true,
          showPlayers: true,
          showTeams: true,
          showCoaches: true,
          showObservations: true,
          showSettings: true,
          showAdmin: true,
          navigationItems: [
            'dashboard',
            'players',
            'teams',
            'coaches',
            'observations',
            'sessions',
            'drills',
            'analytics',
            'player-portal',
            'parent-portal',
            'billing',
            'ai-features',
            'audit-logs',
            'resources',
            'settings',
            'admin',
          ],
        };
        break;
      case 'coach':
        uiConfig = {
          showDashboard: true,
          showPlayers: true,
          showTeams: true,
          showCoaches: false,
          showObservations: true,
          showSettings: false,
          showAdmin: false,
          navigationItems: [
            'dashboard',
            'players',
            'teams',
            'observations',
            'sessions',
            'drills',
            'analytics',
            'player-portal',
          ],
        };
        break;
      case 'player':
        uiConfig = {
          showDashboard: true,
          showPlayers: false,
          showTeams: false,
          showCoaches: false,
          showObservations: true,
          showSettings: false,
          showAdmin: false,
          navigationItems: [
            'dashboard',
            'observations',
            'player-portal',
            'sessions',
            'drills',
          ],
        };
        break;
      case 'parent':
        uiConfig = {
          showDashboard: true,
          showPlayers: false,
          showTeams: false,
          showCoaches: false,
          showObservations: true,
          showSettings: false,
          showAdmin: false,
          navigationItems: [
            'dashboard',
            'observations',
            'parent-portal',
            'sessions',
            'drills',
          ],
        };
        break;
      default:
        uiConfig = {
          showDashboard: true,
          showPlayers: false,
          showTeams: false,
          showCoaches: false,
          showObservations: false,
          showSettings: false,
          showAdmin: false,
          navigationItems: ['dashboard'],
        };
    }

    return Response.json(uiConfig);
  } catch (error) {
    // Error handled silently
    return Response.json(
      { error: 'Failed to fetch UI configuration' },
      { status: 500 }
    );
  }
} 