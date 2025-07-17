/**
 * Client-safe role types and enums
 * This file contains only the types and enums needed for client-side role checking
 * without any server-side dependencies like Supabase or next/headers
 */

export enum PersonType {
  PLAYER = 'player',
  COACH = 'coach',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  PARENT = 'parent',
  OBSERVER = 'observer',
}

export enum Capability {
  // Player capabilities
  VIEW_OWN_DEVELOPMENT_PLANS = 'view_own_development_plans',
  VIEW_OWN_OBSERVATIONS = 'view_own_observations',
  SUBMIT_SELF_REFLECTION = 'submit_self_reflection',
  ACCESS_PLAYER_PORTAL = 'access_player_portal',

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

export interface RoleContext {
  personId: string;
  organizationId: string;
  groupId?: string;
  contextType?: string;
}

export interface StoredRoleContext {
  personId: string;
  organizationId: string;
  groupId?: string;
  contextType?: string;
  role: string;
} 