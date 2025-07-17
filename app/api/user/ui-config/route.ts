import { getCurrentUser } from '@/lib/db/user-service';
import { getRoleUiConfig } from '@/lib/db/role-logic';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // KISS: UI config based only on personType
    let uiConfig;
    switch (user.personType) {
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
    console.error('Error fetching UI config:', error);
    return Response.json(
      { error: 'Failed to fetch UI configuration' },
      { status: 500 }
    );
  }
} 