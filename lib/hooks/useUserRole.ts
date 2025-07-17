import useSWR from 'swr';
import { Capability, PersonType } from '@/lib/db/role-types';

interface UserRoleData {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    personType?: string;
    isAdmin?: boolean;
    isSuperadmin?: boolean;
    organizationId?: string;
  } | null;
  uiConfig: {
    showDashboard: boolean;
    showPlayers: boolean;
    showTeams: boolean;
    showCoaches: boolean;
    showObservations: boolean;
    showSettings: boolean;
    showAdmin: boolean;
    navigationItems: string[];
  };
  isLoading: boolean;
  error: any;
  hasCapability: (capability: Capability) => boolean;
  hasRole: (role: PersonType) => boolean;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useUserRole(): UserRoleData {
  const {
    data: user,
    error: userError,
    isLoading: userLoading,
  } = useSWR('/api/user', fetcher);

  const {
    data: uiConfig,
    error: configError,
    isLoading: configLoading,
  } = useSWR(user?.id ? `/api/user/ui-config` : null, fetcher);

  const isLoading = userLoading || configLoading;
  const error = userError || configError;

  // Default UI config if not available
  const defaultUiConfig = {
    showDashboard: true,
    showPlayers: false,
    showTeams: false,
    showCoaches: false,
    showObservations: false,
    showSettings: false,
    showAdmin: false,
    navigationItems: ['dashboard'],
  };

  // Simple capability checking based on user role
  const hasCapability = (capability: Capability): boolean => {
    if (!user) return false;

    const userRole = user.personType as PersonType;
    const isSuperadmin = user.isSuperadmin;
    const isAdmin = user.isAdmin || isSuperadmin;

    // Superadmin has all capabilities
    if (isSuperadmin) return true;

    // Admin has most capabilities
    if (isAdmin) {
      // Exclude superadmin-only capabilities
      if (
        capability === Capability.MANAGE_ORGANIZATIONS ||
        capability === Capability.MANAGE_SUBSCRIPTION
      ) {
        return false;
      }
      return true;
    }

    // Role-specific capabilities
    switch (capability) {
      case Capability.VIEW_OWN_DEVELOPMENT_PLANS:
      case Capability.VIEW_OWN_OBSERVATIONS:
      case Capability.SUBMIT_SELF_REFLECTION:
      case Capability.ACCESS_PLAYER_PORTAL:
        return (
          userRole === PersonType.PLAYER ||
          userRole === PersonType.COACH ||
          isAdmin
        );

      case Capability.VIEW_TEAM_PLAYERS:
      case Capability.ADD_PLAYER:
      case Capability.EDIT_PLAYER:
      case Capability.CREATE_DEVELOPMENT_PLAN:
      case Capability.ADD_OBSERVATION:
      case Capability.MANAGE_PRACTICE:
        return userRole === PersonType.COACH || isAdmin;

      case Capability.MANAGE_COACHES:
      case Capability.MANAGE_TEAMS:
      case Capability.VIEW_ORGANIZATION_DATA:
        return isAdmin;

      case Capability.VIEW_CHILD_DEVELOPMENT:
        return userRole === PersonType.PARENT || isAdmin;

      default:
        return false;
    }
  };

  // Simple role checking
  const hasRole = (role: PersonType): boolean => {
    if (!user) return false;
    return (
      user.personType === role ||
      (role === PersonType.ADMIN && user.isAdmin) ||
      (role === PersonType.SUPERADMIN && user.isSuperadmin)
    );
  };

  return {
    user: user || null,
    uiConfig: uiConfig || defaultUiConfig,
    isLoading,
    error,
    hasCapability,
    hasRole,
  };
} 