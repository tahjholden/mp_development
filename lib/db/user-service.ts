/**
 * User Service
 *
 * This service bridges the gap between mp_core (authentication) and mpbc (basketball roles) systems.
 * It provides a unified interface for user data that combines:
 *
 * 1. Authentication data from mp_core_person
 * 2. Basketball role data from mpbc_person (source of truth)
 * 3. Additional roles from mp_core_person_role
 * 4. Basketball-specific roles from mpbc_person_role
 *
 * The service handles both global (mp_core) and vertical-specific (mpbc) role logic.
 */

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
  PersonType,
  Capability,
  hasCapability,
  getAllPersonRoles,
  getPersonRolesWithContext,
} from '@/lib/db/role-logic';
import {
  BasketballRoleType,
  getBasketballRoles,
  hasBasketballRole,
  BasketballRole,
} from '@/lib/db/basketball-roles';
import { NextResponse } from 'next/server';
import { getPackFeatures } from '@/lib/db/packs';

/**
 * Core user data from mp_core_person
 */
export interface CoreUser {
  id: string;
  authUid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Basketball user data from mpbc_person
 */
export interface BasketballUser {
  id: string;
  personId: string;
  personType: PersonType;
  organizationId: string;
  displayName?: string;
  isAdmin: boolean;
  isSuperadmin: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Combined user data with roles
 */
export interface UnifiedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  personType?: string;
  organizationId?: string;
  isAdmin?: boolean;
  isSuperadmin?: boolean;
  authUid?: string;
  mpCorePersonId?: string;
  mpbcPersonId?: string;
  roles?: any[];
  basketballRoles?: any[];
  packFeatures?: Record<string, boolean>;
  organizationName?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get the current authenticated user with unified role data
 */
export async function getCurrentUser(): Promise<UnifiedUser | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // KISS: Use only mpbc_person, lookup by email
    const { data: mpbcUser, error } = await supabase
      .from('mpbc_person')
      .select('*')
      .eq('email', user.email)
      .single();

    if (error || !mpbcUser) return null;

    return {
      id: mpbcUser.id,
      email: mpbcUser.email,
      firstName: mpbcUser.first_name,
      lastName: mpbcUser.last_name,
      personType: mpbcUser.person_type,
      organizationId: mpbcUser.organization_id,
      active: mpbcUser.active,
      createdAt: mpbcUser.created_at ? new Date(mpbcUser.created_at) : undefined,
      updatedAt: mpbcUser.updated_at ? new Date(mpbcUser.updated_at) : undefined,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get a user by email with unified role data
 */
export async function getUserByEmail(
  email: string
): Promise<UnifiedUser | null> {
  try {
    const supabase = createClient();

    // Get core user data by email
    const { data: coreUser, error: coreError } = await supabase
      .from('mp_core_person')
      .select(
        'id, auth_uid, email, first_name, last_name, organization_id, active, created_at, updated_at'
      )
      .eq('email', email)
      .single();

    if (coreError || !coreUser) {
      console.error('Error fetching core user by email:', coreError);
      return null;
    }

    // Get basketball user data
    const { data: basketballUser } = await supabase
      .from('mpbc_person')
      .select(
        'id, mp_core_person_id, person_type, organization_id, first_name, last_name, email, created_at, updated_at'
      )
      .eq('mp_core_person_id', coreUser.id)
      .maybeSingle();

    // Get organization name
    const { data: organization } = await supabase
      .from('mp_core_organizations')
      .select('name')
      .eq('id', coreUser.organization_id)
      .maybeSingle();

    // Get all roles
    const roles = await getAllPersonRoles(coreUser.id);

    // Get basketball-specific roles
    const basketballRoles = await getBasketballRoles(coreUser.id);

    // Get pack features
    const packFeatures = await getPackFeatures(coreUser.organization_id);

    // Build unified user object
    const unifiedUser: UnifiedUser = {
      id: coreUser.id,
      authUid: coreUser.auth_uid,
      email: coreUser.email,
      firstName: coreUser.first_name,
      lastName: coreUser.last_name,
      mpCorePersonId: coreUser.id,
      mpbcPersonId: basketballUser?.id,
      personType: basketballUser?.person_type,
      isAdmin:
        (basketballUser?.person_type as PersonType) === PersonType.ADMIN ||
        (basketballUser?.person_type as PersonType) === PersonType.SUPERADMIN,
      isSuperadmin:
        (basketballUser?.person_type as PersonType) === PersonType.SUPERADMIN,
      organizationId: coreUser.organization_id,
      organizationName: organization?.name,
      active: coreUser.active,
      createdAt: new Date(coreUser.created_at),
      ...(coreUser.updated_at
        ? { updatedAt: new Date(coreUser.updated_at) }
        : {}),
      roles,
      basketballRoles,
      packFeatures: packFeatures as unknown as Record<string, boolean>,
    };

    return unifiedUser;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get a user by ID with unified role data
 */
export async function getUserById(userId: string): Promise<UnifiedUser | null> {
  try {
    const supabase = createClient();

    // Query mpbc_person using mp_core_person_id - the userId is actually the mp_core_person.id
    const { data: basketballUser, error: basketballError } = await supabase
      .from('mpbc_person')
      .select(
        'id, mp_core_person_id, person_type, organization_id, first_name, last_name, email, created_at, updated_at'
      )
      .eq('mp_core_person_id', userId)
      .single();

    console.log('getUserById - Direct mpbc_person query:', {
      userId: userId,
      basketballUser: basketballUser,
      basketballError: basketballError,
      personType: basketballUser?.person_type,
    });

    if (basketballError || !basketballUser) {
      console.error('Error fetching basketball user:', basketballError);
      return null;
    }

    // Build unified user object from mpbc_person data
    const unifiedUser: UnifiedUser = {
      id: basketballUser.id,
      authUid: '', // Not needed for app logic
      email: basketballUser.email || '',
      firstName: basketballUser.first_name,
      lastName: basketballUser.last_name,
      mpCorePersonId: userId,
      mpbcPersonId: basketballUser.id,
      personType: basketballUser.person_type,
      isAdmin:
        (basketballUser.person_type as PersonType) === PersonType.ADMIN ||
        (basketballUser.person_type as PersonType) === PersonType.SUPERADMIN,
      isSuperadmin:
        (basketballUser.person_type as PersonType) === PersonType.SUPERADMIN,
      roles: [],
      basketballRoles: [],
      packFeatures: {},
    };

    return unifiedUser;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role: PersonType | BasketballRoleType,
  organizationId?: string,
  includeInactive: boolean = false
): Promise<UnifiedUser[]> {
  try {
    const supabase = createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    // Use provided organizationId or default to current user's org
    const orgId = organizationId || currentUser.organizationId;

    // Check if user has permission to view users in this organization
    if (orgId !== currentUser.organizationId && !currentUser.isSuperadmin) {
      return [];
    }

    // Get users based on role type
    let userIds: string[] = [];

    // Check if it's a core role or a basketball-specific role
    if (Object.values(PersonType).includes(role as PersonType)) {
      // It's a core role, query mpbc_person
      const { data: users } = await supabase
        .from('mpbc_person')
        .select('person_id')
        .eq('organization_id', orgId)
        .eq('person_type', role);

      if (users) {
        userIds = users.map(u => u.person_id);
      }
    } else {
      // It's a basketball-specific role, query mpbc_person_role
      const { data: users } = await supabase
        .from('mpbc_person_role')
        .select('person_id')
        .eq('organization_id', orgId)
        .eq('role', role)
        .eq('active', true);

      if (users) {
        userIds = users.map(u => u.person_id);
      }
    }

    // Get full user data for each user ID
    const unifiedUsers: UnifiedUser[] = [];

    for (const userId of userIds) {
      const user = await getUserById(userId);
      if (user && (includeInactive || user.active)) {
        unifiedUsers.push(user);
      }
    }

    return unifiedUsers;
  } catch (error) {
    console.error('Error getting users by role:', error);
    return [];
  }
}

/**
 * Check if the current user has a capability
 */
export async function currentUserHasCapability(
  capability: Capability,
  context?: RoleContext
): Promise<boolean> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return false;
  }

  return hasCapability(
    currentUser.id,
    capability,
    context || currentUser.currentContext
  );
}

/**
 * Check if the current user has a basketball role
 */
export async function currentUserHasBasketballRole(
  role: BasketballRoleType | string,
  context?: RoleContext
): Promise<boolean> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return false;
  }

  return hasBasketballRole(
    currentUser.id,
    role,
    context || currentUser.currentContext
  );
}

/**
 * Switch the current user's active role context
 */
export async function switchUserRoleContext(
  role: string,
  context: RoleContext
): Promise<boolean> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return false;
  }

  const success = await switchActiveRole(currentUser.id, role, context);

  if (success) {
    // Store the new context in cookies
    await storeRoleContextInCookies({
      personId: context.personId,
      organizationId: context.organizationId,
      ...(context.groupId ? { groupId: context.groupId } : {}),
      ...(context.contextType ? { contextType: context.contextType } : {}),
      role,
    });
  }

  return success;
}

/**
 * Get the role context from cookies
 */
async function getRoleContextFromCookies(): Promise<StoredRoleContext | null> {
  try {
    const cookieStore = await cookies();
    const contextCookie = cookieStore.get('role_context');

    if (!contextCookie) {
      return null;
    }

    return JSON.parse(
      decodeURIComponent(contextCookie.value)
    ) as StoredRoleContext;
  } catch (error) {
    console.error('Error getting role context from cookies:', error);
    return null;
  }
}

/**
 * Store the role context in cookies
 */
async function storeRoleContextInCookies(
  context: StoredRoleContext
): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(
      'role_context',
      encodeURIComponent(JSON.stringify(context)),
      {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }
    );
  } catch (error) {
    console.error('Error storing role context in cookies:', error);
  }
}

/**
 * Clear the role context from cookies
 */
export async function clearRoleContextFromCookies(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('role_context');
  } catch (error) {
    console.error('Error clearing role context from cookies:', error);
  }
}

/**
 * Middleware to check if the current user has a capability
 * For use in API routes
 */
export async function requireCapability(
  capability: Capability,
  context?: RoleContext
): Promise<Response | null> {
  const hasAccess = await currentUserHasCapability(capability, context);

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

/**
 * Middleware to check if the current user has a specific role
 * For use in API routes
 */
export async function requireRole(
  role: PersonType | BasketballRoleType | string,
  context?: RoleContext
): Promise<Response | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if it's a core role or a basketball-specific role
  if (Object.values(PersonType).includes(role as PersonType)) {
    // It's a core role
    if (!currentUser.roles?.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else {
    // It's a basketball-specific role
    const hasRole = await currentUserHasBasketballRole(role, context);
    if (!hasRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return null;
}

/**
 * Get users in a team with their roles
 */
export async function getUsersInTeam(teamId: string): Promise<UnifiedUser[]> {
  try {
    const supabase = createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    // Check if user has permission to view this team
    const canView = await hasCapability(
      currentUser.id,
      Capability.VIEW_TEAM_PLAYERS,
      { ...currentUser.currentContext!, groupId: teamId }
    );

    if (!canView && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return [];
    }

    // Get all users in the team
    const { data: teamMembers } = await supabase
      .from('mp_core_person_group')
      .select('person_id, role')
      .eq('group_id', teamId)
      .eq('active', true);

    if (!teamMembers) {
      return [];
    }

    // Get full user data for each team member
    const unifiedUsers: UnifiedUser[] = [];

    for (const member of teamMembers) {
      const user = await getUserById(member.person_id);
      if (user) {
        // Add team role to the user object
        unifiedUsers.push({
          ...user,
        });
      }
    }

    return unifiedUsers;
  } catch (error) {
    console.error('Error getting users in team:', error);
    return [];
  }
}

/**
 * Create or update a user with unified role data
 */
export async function createOrUpdateUser(userData: {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  organizationId: string;
  primaryRole: PersonType;
  isAdmin?: boolean;
  isSuperadmin?: boolean;
  basketballRoles?: BasketballRole[];
  active?: boolean;
}): Promise<string | null> {
  try {
    const supabase = createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return null;
    }

    // Check if current user has permission to create/update users
    if (!currentUser.isAdmin && !currentUser.isSuperadmin) {
      return null;
    }

    // Check if organization ID is valid
    if (
      userData.organizationId !== currentUser.organizationId &&
      !currentUser.isSuperadmin
    ) {
      return null;
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('mp_core_person')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle();

    let userId: string;

    if (existingUser) {
      // Update existing user
      userId = existingUser.id;

      await supabase
        .from('mp_core_person')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          active: userData.active !== undefined ? userData.active : true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Update mpbc_person
      const { data: existingMpbcPerson } = await supabase
        .from('mpbc_person')
        .select('id')
        .eq('person_id', userId)
        .maybeSingle();

      if (existingMpbcPerson) {
        await supabase
          .from('mpbc_person')
          .update({
            person_type: userData.primaryRole,
            display_name:
              userData.displayName ||
              `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            is_admin: userData.isAdmin || false,
            is_superadmin: userData.isSuperadmin || false,
            updated_at: new Date().toISOString(),
          })
          .eq('person_id', userId);
      } else {
        await supabase.from('mpbc_person').insert({
          person_id: userId,
          person_type: userData.primaryRole,
          organization_id: userData.organizationId,
          display_name:
            userData.displayName ||
            `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          is_admin: userData.isAdmin || false,
          is_superadmin: userData.isSuperadmin || false,
        });
      }
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('mp_core_person')
        .insert({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          organization_id: userData.organizationId,
          person_type: userData.primaryRole,
          active: userData.active !== undefined ? userData.active : true,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error || !newUser) {
        console.error('Error creating user:', error);
        return null;
      }

      userId = newUser.id;

      // Create mpbc_person
      await supabase.from('mpbc_person').insert({
        person_id: userId,
        person_type: userData.primaryRole,
        organization_id: userData.organizationId,
        display_name:
          userData.displayName ||
          `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        is_admin: userData.isAdmin || false,
        is_superadmin: userData.isSuperadmin || false,
      });
    }

    // Add or update basketball roles
    if (userData.basketballRoles && userData.basketballRoles.length > 0) {
      // First, deactivate all existing basketball roles
      await supabase
        .from('mpbc_person_role')
        .update({
          active: false,
          ended_at: new Date().toISOString(),
        })
        .eq('person_id', userId);

      // Then add new roles
      for (const role of userData.basketballRoles) {
        await supabase.from('mpbc_person_role').insert({
          person_id: userId,
          organization_id: userData.organizationId,
          role: role.role,
          permissions: role.permissions || [],
          scope_type: role.scopeType || 'organization',
          scope_ids: role.scopeIds || [],
          active: true,
          started_at: new Date().toISOString(),
        });
      }
    }

    return userId;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
}

/**
 * Get all teams for a user based on their roles
 */
export async function getUserTeams(userId?: string): Promise<any[]> {
  try {
    const supabase = createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    // Use provided userId or default to current user
    const targetUserId = userId || currentUser.id;

    // Check if current user has permission to view this user's teams
    if (
      targetUserId !== currentUser.id &&
      !currentUser.isAdmin &&
      !currentUser.isSuperadmin
    ) {
      const canView = await hasCapability(
        currentUser.id,
        Capability.VIEW_ORGANIZATION_DATA
      );

      if (!canView) {
        return [];
      }
    }

    // Get all teams the user is associated with
    const { data: userGroups } = await supabase
      .from('mp_core_person_group')
      .select('group_id, role')
      .eq('person_id', targetUserId)
      .eq('active', true);

    if (!userGroups || userGroups.length === 0) {
      return [];
    }

    // Get team details
    const teamIds = userGroups.map(ug => ug.group_id);
    const { data: teams } = await supabase
      .from('mp_core_group')
      .select('*')
      .in('id', teamIds);

    if (!teams) {
      return [];
    }

    // Combine team data with role
    return teams.map(team => {
      const userGroup = userGroups.find(ug => ug.group_id === team.id);
      return {
        ...team,
        userRole: userGroup?.role,
      };
    });
  } catch (error) {
    console.error('Error getting user teams:', error);
    return [];
  }
}

/**
 * Check if a user is part of a team with a specific role
 */
export async function isUserInTeamWithRole(
  userId: string,
  teamId: string,
  role?: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    let query = supabase
      .from('mp_core_person_group')
      .select('id')
      .eq('person_id', userId)
      .eq('group_id', teamId)
      .eq('active', true);

    if (role) {
      query = query.eq('role', role);
    }

    const { data } = await query;

    return !!data && data.length > 0;
  } catch (error) {
    console.error('Error checking if user is in team with role:', error);
    return false;
  }
}

/**
 * Add a user to a team with a specific role
 */
export async function addUserToTeam(
  userId: string,
  teamId: string,
  role: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return false;
    }

    // Check if current user has permission to manage teams
    const canManage = await hasCapability(
      currentUser.id,
      Capability.MANAGE_TEAMS
    );

    if (!canManage && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return false;
    }

    // Check if user is already in the team
    const { data: existingMembership } = await supabase
      .from('mp_core_person_group')
      .select('id')
      .eq('person_id', userId)
      .eq('group_id', teamId)
      .maybeSingle();

    if (existingMembership) {
      // Update existing membership
      await supabase
        .from('mp_core_person_group')
        .update({
          role,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMembership.id);
    } else {
      // Create new membership
      await supabase.from('mp_core_person_group').insert({
        person_id: userId,
        group_id: teamId,
        role,
        active: true,
        created_at: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error('Error adding user to team:', error);
    return false;
  }
}

/**
 * Remove a user from a team
 */
export async function removeUserFromTeam(
  userId: string,
  teamId: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return false;
    }

    // Check if current user has permission to manage teams
    const canManage = await hasCapability(
      currentUser.id,
      Capability.MANAGE_TEAMS
    );

    if (!canManage && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return false;
    }

    // Update membership to inactive
    await supabase
      .from('mp_core_person_group')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('person_id', userId)
      .eq('group_id', teamId);

    return true;
  } catch (error) {
    console.error('Error removing user from team:', error);
    return false;
  }
}
