/**
 * Role Logic System
 *
 * This file implements the canonical role logic system based on the following rules:
 *
 * 1. Person Type = Source of Truth
 *    All role-based identity (coach, player, admin, etc.) should be determined by:
 *    mpbc_person.person_type
 *
 * 2. All App Logic Derives from mpbc_person
 *    The app should treat mpbc_person as the source for:
 *    - Role (person_type: player, coach, etc)
 *    - Display name
 *    - Team/group association
 *    - Development plans, observations, metrics
 *
 * 3. Auth Layer Is Separate
 *    Authentication (email, auth_uid, etc.) still lives in mp_core_person or auth.users and links via:
 *    mpbc_person.person_id → mp_core_person.id → auth.users.id
 *
 * 4. Consistency Layer
 *    Multiple roles are explicitly stored via person_type or a scoped mp_core_person_role
 */

import { createClient } from '@/lib/supabase/server';
import { getPackFeatures, isFeatureAvailable } from '@/lib/db/packs';

/**
 * Role types in the system
 */
export enum PersonType {
  PLAYER = 'player',
  COACH = 'coach',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  PARENT = 'parent',
  OBSERVER = 'observer',
}

/**
 * Role capabilities in the system
 */
export enum Capability {
  // Player capabilities
  VIEW_OWN_DEVELOPMENT_PLANS = 'view_own_development_plans',
  VIEW_OWN_OBSERVATIONS = 'view_own_observations',
  SUBMIT_SELF_REFLECTION = 'submit_self_reflection',

  // Coach capabilities
  VIEW_TEAM_PLAYERS = 'view_team_players',
  ADD_PLAYER = 'add_player',
  EDIT_PLAYER = 'edit_player',
  CREATE_DEVELOPMENT_PLAN = 'create_development_plan',
  ADD_OBSERVATION = 'add_observation',
  MANAGE_PRACTICE = 'manage_practice',

  // Admin capabilities
  MANAGE_COACHES = 'manage_coaches',
  MANAGE_TEAMS = 'manage_teams',
  VIEW_ORGANIZATION_DATA = 'view_organization_data',

  // Superadmin capabilities
  MANAGE_ORGANIZATIONS = 'manage_organizations',
  MANAGE_SUBSCRIPTION = 'manage_subscription',
  MANAGE_PHILOSOPHY_PACK = 'manage_philosophy_pack',

  // Parent capabilities
  VIEW_CHILD_DEVELOPMENT = 'view_child_development',

  // Observer capabilities
  VIEW_ASSIGNED_TEAMS = 'view_assigned_teams',
}

/**
 * Data access levels
 */
export enum AccessLevel {
  NONE = 'none',
  OWN = 'own',
  TEAM = 'team',
  ORGANIZATION = 'organization',
  ALL = 'all',
}

/**
 * Role context for multi-role scenarios
 */
export interface RoleContext {
  personId: string;
  organizationId: string;
  groupId?: string;
  contextType?: 'team' | 'organization' | 'system';
}

/**
 * Person with role information
 */
export interface PersonWithRole {
  id: string;
  person_type: PersonType;
  organization_id: string;
  is_admin?: boolean;
  is_superadmin?: boolean;
  display_name?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Get a person's primary role
 */
export async function getPersonRole(
  personId: string
): Promise<PersonType | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mpbc_person')
    .select('person_type')
    .eq('id', personId)
    .single();

  if (error || !data) {
    console.error('Error fetching person role:', error);
    return null;
  }

  return data.person_type as PersonType;
}

/**
 * Get all roles for a person
 */
export async function getAllPersonRoles(personId: string): Promise<string[]> {
  const supabase = createClient();

  // Get primary role from mpbc_person
  const { data: personData, error: personError } = await supabase
    .from('mpbc_person')
    .select('person_type')
    .eq('id', personId)
    .single();

  if (personError || !personData) {
    console.error('Error fetching person data:', personError);
    return [];
  }

  // Get additional roles from mp_core_person_role
  const { data: roleData, error: roleError } = await supabase
    .from('mp_core_person_role')
    .select('role')
    .eq('person_id', personId)
    .eq('active', true);

  // Get basketball-specific roles from mpbc_person_role
  const { data: bbRoleData, error: bbRoleError } = await supabase
    .from('mpbc_person_role')
    .select('role')
    .eq('person_id', personId)
    .eq('active', true);

  if (roleError) {
    console.error('Error fetching person roles:', roleError);
    return [personData.person_type];
  }

  // Combine primary role with additional roles
  const roles = [personData.person_type];
  if (roleData) {
    roleData.forEach(r => roles.push(r.role));
  }

  if (bbRoleError) {
    console.error('Error fetching mpbc person roles:', bbRoleError);
  } else if (bbRoleData) {
    bbRoleData.forEach(r => roles.push(r.role));
  }

  return [...new Set(roles)]; // Remove duplicates
}

/**
 * Check if a person has a specific role
 */
export async function hasRole(
  personId: string,
  role: PersonType
): Promise<boolean> {
  const roles = await getAllPersonRoles(personId);
  return roles.includes(role);
}

/**
 * Check if a person has a specific capability
 */
export async function hasCapability(
  personId: string,
  capability: Capability,
  context?: RoleContext
): Promise<boolean> {
  const supabase = createClient();

  // Get person with role information
  const { data: person, error } = await supabase
    .from('mpbc_person')
    .select('id, person_type, organization_id, is_admin, is_superadmin')
    .eq('id', personId)
    .single();

  if (error || !person) {
    console.error('Error fetching person data:', error);
    return false;
  }

  // SuperAdmin has all capabilities
  if (person.is_superadmin) {
    return true;
  }

  // Organization admin has all org-level capabilities
  if (person.is_admin && isOrgLevelCapability(capability)) {
    return true;
  }

  // Check capability based on person_type (source of truth)
  const personType = person.person_type as PersonType;

  // Get pack features if needed for advanced capabilities
  const packFeatures = await getPackFeatures(person.organization_id);

  // Check capability based on role and context
  switch (capability) {
    // Player capabilities
    case Capability.VIEW_OWN_DEVELOPMENT_PLANS:
    case Capability.VIEW_OWN_OBSERVATIONS:
    case Capability.SUBMIT_SELF_REFLECTION:
      return personType === PersonType.PLAYER || personType === PersonType.COACH || 
             person.is_admin || person.is_superadmin;
    
    // Coach capabilities
    case Capability.VIEW_TEAM_PLAYERS:
    case Capability.ADD_PLAYER:
    case Capability.EDIT_PLAYER:
    case Capability.CREATE_DEVELOPMENT_PLAN:
    case Capability.ADD_OBSERVATION:
    case Capability.MANAGE_PRACTICE:
      // Basic coaching capabilities
      if (personType !== PersonType.COACH && !person.is_admin && !person.is_superadmin) {
        return false;
      }
      
      // If context is provided, check if coach is assigned to the team
      if (context?.groupId && personType === PersonType.COACH) {
        return await isCoachAssignedToTeam(personId, context.groupId);
      }
      
      return true;
    
    // Admin capabilities
    case Capability.MANAGE_COACHES:
    case Capability.MANAGE_TEAMS:
    case Capability.VIEW_ORGANIZATION_DATA:
      return person.is_admin || person.is_superadmin;
    
    // Superadmin capabilities
    case Capability.MANAGE_ORGANIZATIONS:
    case Capability.MANAGE_SUBSCRIPTION:
      return person.is_superadmin;
    
    // Philosophy pack management - requires superadmin or admin with feature
    case Capability.MANAGE_PHILOSOPHY_PACK:
      if (person.is_superadmin) return true;
      if (person.is_admin && packFeatures?.philosophyOverlay) return true;
      return false;
    
    // Parent capabilities
    case Capability.VIEW_CHILD_DEVELOPMENT:
      if (personType !== PersonType.PARENT && !person.is_admin && !person.is_superadmin) {
        return false;
      }
      
      // If context is provided, check if parent is linked to the player
      if (context?.personId && personType === PersonType.PARENT) {
        return await isParentOfPlayer(personId, context.personId);
      }
      
      return person.is_admin || person.is_superadmin;
    
    // Observer capabilities
    case Capability.VIEW_ASSIGNED_TEAMS:
      if (personType !== PersonType.OBSERVER && !person.is_admin && !person.is_superadmin) {
        return false;
      }
      
      // If context is provided, check if observer is assigned to the team
      if (context?.groupId && personType === PersonType.OBSERVER) {
        return await isObserverAssignedToTeam(personId, context.groupId);
      }
      
      return person.is_admin || person.is_superadmin;
    
    default:
      return false;
  }
}

/**
 * Check if a capability is organization-level
 */
function isOrgLevelCapability(capability: Capability): boolean {
  const orgLevelCapabilities = [
    Capability.MANAGE_COACHES,
    Capability.MANAGE_TEAMS,
    Capability.VIEW_ORGANIZATION_DATA,
    Capability.MANAGE_PHILOSOPHY_PACK,
  ];

  return orgLevelCapabilities.includes(capability);
}

/**
 * Check if a coach is assigned to a team
 */
async function isCoachAssignedToTeam(
  coachId: string,
  teamId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mp_core_person_group')
    .select('id')
    .eq('person_id', coachId)
    .eq('group_id', teamId)
    .eq('role', 'coach')
    .single();

  if (error) {
    console.error('Error checking coach assignment:', error);
    return false;
  }

  return !!data;
}

/**
 * Check if a parent is linked to a player
 */
async function isParentOfPlayer(
  parentId: string,
  playerId: string
): Promise<boolean> {
  const supabase = createClient();

  // This would depend on your specific schema for parent-player relationships
  // Here's an example assuming there's a parent_player_relation table
  const { data, error } = await supabase
    .from('parent_player_relation')
    .select('id')
    .eq('parent_id', parentId)
    .eq('player_id', playerId)
    .single();

  if (error) {
    console.error('Error checking parent-player relationship:', error);
    return false;
  }

  return !!data;
}

/**
 * Check if an observer is assigned to a team
 */
async function isObserverAssignedToTeam(
  observerId: string,
  teamId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mp_core_person_group')
    .select('id')
    .eq('person_id', observerId)
    .eq('group_id', teamId)
    .eq('role', 'observer')
    .single();

  if (error) {
    console.error('Error checking observer assignment:', error);
    return false;
  }

  return !!data;
}

/**
 * Get a person's data access level for a specific entity type
 */
export async function getDataAccessLevel(
  personId: string,
  entityType: 'player' | 'team' | 'observation' | 'development_plan'
): Promise<AccessLevel> {
  const supabase = createClient();

  // Get person with role information
  const { data: person, error } = await supabase
    .from('mpbc_person')
    .select('id, person_type, organization_id, is_admin, is_superadmin')
    .eq('id', personId)
    .single();

  if (error || !person) {
    console.error('Error fetching person data:', error);
    return AccessLevel.NONE;
  }

  // SuperAdmin has access to all data
  if (person.is_superadmin) {
    return AccessLevel.ALL;
  }

  // Organization admin has access to all org data
  if (person.is_admin) {
    return AccessLevel.ORGANIZATION;
  }

  // Access level based on person_type (source of truth)
  const personType = person.person_type as PersonType;

  switch (personType) {
    case PersonType.PLAYER:
      // Players can only see their own data
      return AccessLevel.OWN;

    case PersonType.COACH:
      // Coaches can see team data
      return AccessLevel.TEAM;

    case PersonType.PARENT:
      // Parents can see their children's data (treated as "own")
      return AccessLevel.OWN;

    case PersonType.OBSERVER:
      // Observers can see assigned team data
      return AccessLevel.TEAM;

    default:
      return AccessLevel.NONE;
  }
}

/**
 * Get SQL conditions for data access based on role
 */
export async function getDataAccessConditions(
  personId: string,
  tableName: string,
  tableAlias: string = 't'
): Promise<string> {
  const supabase = createClient();

  // Get person with role information
  const { data: person, error } = await supabase
    .from('mpbc_person')
    .select('id, person_type, organization_id, is_admin, is_superadmin')
    .eq('id', personId)
    .single();

  if (error || !person) {
    console.error('Error fetching person data:', error);
    return '1=0'; // No access
  }

  // SuperAdmin has access to all data
  if (person.is_superadmin) {
    return '1=1'; // Full access
  }

  // Organization admin has access to all org data
  if (person.is_admin) {
    return `${tableAlias}.organization_id = '${person.organization_id}'`;
  }

  // Access conditions based on person_type (source of truth)
  const personType = person.person_type as PersonType;

  switch (personType) {
    case PersonType.PLAYER:
      // Players can only see their own data
      if (
        tableName === 'mpbc_development_plan' ||
        tableName === 'mpbc_observations'
      ) {
        return `${tableAlias}.person_id = '${personId}'`;
      }
      return `${tableAlias}.id = '${personId}'`;

    case PersonType.COACH:
      // Coaches can see data for their teams
      const { data: coachTeams } = await supabase
        .from('mp_core_person_group')
        .select('group_id')
        .eq('person_id', personId)
        .eq('role', 'coach');

      if (!coachTeams || coachTeams.length === 0) {
        return '1=0'; // No teams, no access
      }

      const teamIds = coachTeams.map(t => `'${t.group_id}'`).join(',');

      if (tableName === 'mp_core_person') {
        return `${tableAlias}.id IN (
          SELECT person_id FROM mp_core_person_group 
          WHERE group_id IN (${teamIds})
        )`;
      }

      if (
        tableName === 'mpbc_development_plan' ||
        tableName === 'mpbc_observations'
      ) {
        return `${tableAlias}.person_id IN (
          SELECT person_id FROM mp_core_person_group 
          WHERE group_id IN (${teamIds})
        )`;
      }

      if (tableName === 'mp_core_group') {
        return `${tableAlias}.id IN (${teamIds})`;
      }

      return `${tableAlias}.group_id IN (${teamIds})`;

    default:
      return '1=0'; // No access by default
  }
}

/**
 * Get all persons with a specific role in an organization
 */
export async function getPersonsByRole(
  organizationId: string,
  role: PersonType
): Promise<PersonWithRole[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mpbc_person')
    .select(
      'id, person_type, organization_id, is_admin, is_superadmin, display_name'
    )
    .eq('organization_id', organizationId)
    .eq('person_type', role);

  if (error) {
    console.error('Error fetching persons by role:', error);
    return [];
  }

  return data as PersonWithRole[];
}

/**
 * Get all roles available in the system
 * This can be filtered by pack features
 */
export async function getAvailableRoles(
  organizationId: string
): Promise<PersonType[]> {
  // Base roles always available
  const baseRoles = [PersonType.PLAYER, PersonType.COACH, PersonType.ADMIN];

  // Check pack features for additional roles
  const packFeatures = await getPackFeatures(organizationId);
  
  if (packFeatures?.aiEnabled && packFeatures?.advancedConstraints) {
    baseRoles.push(PersonType.OBSERVER);
  }

  return baseRoles;
}

/**
 * Get UI configuration based on person's role
 */
export async function getRoleUiConfig(
  personId: string
): Promise<Record<string, any>> {
  const supabase = createClient();

  // Get person with role information
  const { data: person, error } = await supabase
    .from('mpbc_person')
    .select('id, person_type, organization_id, is_admin, is_superadmin')
    .eq('id', personId)
    .single();

  if (error || !person) {
    console.error('Error fetching person data:', error);
    return {};
  }

  // Get pack features and UI overrides
  const packFeatures = await getPackFeatures(person.organization_id);

  // Base UI config
  const uiConfig: Record<string, any> = {
    showDashboard: true,
    showPlayers: false,
    showTeams: false,
    showCoaches: false,
    showObservations: false,
    showSettings: false,
    showAdmin: false,
    navigationItems: ['dashboard'],
  };

  // SuperAdmin sees everything
  if (person.is_superadmin) {
    return {
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
        'settings',
        'admin',
      ],
    };
  }

  // Organization admin sees org-level items
  if (person.is_admin) {
    uiConfig.showPlayers = true;
    uiConfig.showTeams = true;
    uiConfig.showCoaches = true;
    uiConfig.showObservations = true;
    uiConfig.showSettings = true;
    uiConfig.showAdmin = true;
    uiConfig.navigationItems = [
      'dashboard',
      'players',
      'teams',
      'coaches',
      'observations',
      'settings',
      'admin',
    ];

    // Adjust based on pack features
    if (!packFeatures?.philosophyOverlay) {
      uiConfig.showAdmin = false;
      uiConfig.navigationItems = uiConfig.navigationItems.filter((item: string) => item !== 'admin');
    }

    return uiConfig;
  }

  // Role-specific UI configuration based on person_type (source of truth)
  const personType = person.person_type as PersonType;

  switch (personType) {
    case PersonType.PLAYER:
      return {
        ...uiConfig,
        showObservations: true,
        navigationItems: ['dashboard', 'observations'],
      };

    case PersonType.COACH:
      return {
        ...uiConfig,
        showPlayers: true,
        showTeams: true,
        showObservations: true,
        navigationItems: ['dashboard', 'players', 'teams', 'observations'],
      };

    case PersonType.PARENT:
      return {
        ...uiConfig,
        showObservations: true,
        navigationItems: ['dashboard', 'observations'],
      };

    case PersonType.OBSERVER:
      return {
        ...uiConfig,
        showTeams: true,
        showObservations: true,
        navigationItems: ['dashboard', 'teams', 'observations'],
      };

    default:
      return uiConfig;
  }
}

/**
 * Check if a person has multiple roles
 */
export async function hasMultipleRoles(personId: string): Promise<boolean> {
  const roles = await getAllPersonRoles(personId);
  return roles.length > 1;
}

/**
 * Get all roles for a person with contexts
 * This is used for handling multiple roles across different contexts
 */
export async function getPersonRolesWithContext(
  personId: string
): Promise<Array<{ role: string; context: RoleContext }>> {
  const supabase = createClient();

  // Get primary role from mpbc_person
  const { data: personData, error: personError } = await supabase
    .from('mpbc_person')
    .select('person_type, organization_id')
    .eq('id', personId)
    .single();

  if (personError || !personData) {
    console.error('Error fetching person data:', personError);
    return [];
  }

  const result: Array<{ role: string; context: RoleContext }> = [
    {
      role: personData.person_type,
      context: {
        personId,
        organizationId: personData.organization_id,
        contextType: 'organization',
      },
    },
  ];

  // Get additional roles from mp_core_person_role with context
  const { data: roleData, error: roleError } = await supabase
    .from('mp_core_person_role')
    .select('role, organization_id, scope_type, scope_ids')
    .eq('person_id', personId)
    .eq('active', true);

  if (roleError) {
    console.error('Error fetching person roles:', roleError);
    return result;
  }

  // Add additional roles with context
  if (roleData) {
    roleData.forEach(r => {
      // For each role, create a context
      const context: RoleContext = {
        personId,
        organizationId: r.organization_id,
        contextType: r.scope_type as 'team' | 'organization' | 'system',
      };

      // If scope is team, add the team ID
      if (r.scope_type === 'team' && r.scope_ids && r.scope_ids.length > 0) {
        context.groupId = r.scope_ids[0];
      }

      result.push({
        role: r.role,
        context,
      });
    });
  }

  // ----- Basketball-specific roles -----
  const { data: bbRoleData, error: bbRoleError } = await supabase
    .from('mpbc_person_role')
    .select('role, organization_id, scope_type, scope_ids')
    .eq('person_id', personId)
    .eq('active', true);

  if (bbRoleError) {
    console.error('Error fetching mpbc person roles:', bbRoleError);
  } else if (bbRoleData) {
    bbRoleData.forEach(r => {
      const context: RoleContext = {
        personId,
        organizationId: r.organization_id,
        contextType: r.scope_type as 'team' | 'organization' | 'system',
      };

      if (r.scope_type === 'team' && r.scope_ids && r.scope_ids.length > 0) {
        context.groupId = r.scope_ids[0];
      }

      result.push({
        role: r.role,
        context,
      });
    });
  }

  return result;
}

/**
 * Switch active role for a user with multiple roles
 * This updates the session to use a different role context
 */
export async function switchActiveRole(
  personId: string,
  newRole: string,
  context: RoleContext
): Promise<boolean> {
  const supabase = createClient();

  // Verify the person has this role in this context
  const roles = await getPersonRolesWithContext(personId);
  const hasRole = roles.some(
    r =>
      r.role === newRole &&
      r.context.organizationId === context.organizationId &&
      (!context.groupId || r.context.groupId === context.groupId)
  );

  if (!hasRole) {
    return false;
  }

  // Store the active role context in the session
  // This would typically update a session or cookie
  // For this example, we'll just return true
  return true;
}

/**
 * Integrate with pack system to check if a feature is available for a role
 */
export async function isFeatureAvailableForRole(
  personId: string,
  feature: string
): Promise<boolean> {
  const supabase = createClient();

  // Get person with role information
  const { data: person, error } = await supabase
    .from('mpbc_person')
    .select('id, person_type, organization_id, is_admin, is_superadmin')
    .eq('id', personId)
    .single();

  if (error || !person) {
    console.error('Error fetching person data:', error);
    return false;
  }

  // SuperAdmin has access to all features
  if (person.is_superadmin) {
    return true;
  }

  // Check if the feature is available in the organization's pack
  const featureAvailable = await isFeatureAvailable(
    person.organization_id,
    feature as any
  );

  // If feature is not available in the pack, no one gets it
  if (!featureAvailable) {
    return false;
  }

  // Organization admin has access to all available features
  if (person.is_admin) {
    return true;
  }

  // Role-specific feature access based on person_type (source of truth)
  const personType = person.person_type as PersonType;

  // Define which features are available to which roles
  const roleFeatures: Record<PersonType, string[]> = {
    [PersonType.PLAYER]: ['playerManagement', 'basicObservations', 'simplePdp'],
    [PersonType.COACH]: [
      'playerManagement',
      'basicObservations',
      'simplePdp',
      'aiEnabled',
      'drillRecommendations',
    ],
    [PersonType.ADMIN]: [
      'playerManagement',
      'basicObservations',
      'simplePdp',
      'aiEnabled',
      'philosophyOverlay',
      'advancedConstraints',
      'drillRecommendations',
    ],
    [PersonType.SUPERADMIN]: [
      'playerManagement',
      'basicObservations',
      'simplePdp',
      'aiEnabled',
      'philosophyOverlay',
      'advancedConstraints',
      'drillRecommendations',
    ],
    [PersonType.PARENT]: ['playerManagement', 'basicObservations'],
    [PersonType.OBSERVER]: [
      'playerManagement',
      'basicObservations',
      'aiEnabled',
    ],
  };

  return roleFeatures[personType]?.includes(feature) || false;
}
