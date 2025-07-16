/**
 * Basketball Roles Module
 *
 * This module provides basketball-specific role types and functions
 * that are used in the user service for basketball context.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Basketball role types
 */
export enum BasketballRoleType {
  PLAYER = 'player',
  COACH = 'coach',
  PARENT = 'parent',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

/**
 * Basketball role interface
 */
export interface BasketballRole {
  id: string;
  personId: string;
  roleType: BasketballRoleType;
  organizationId: string;
  teamId?: string;
  createdAt: Date;
  updatedAt?: Date | undefined;
}

/**
 * Get basketball roles for a person
 */
export async function getBasketballRoles(
  personId: string
): Promise<BasketballRole[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('mpbc_person_role')
      .select('*')
      .eq('person_id', personId);

    if (error) {
      console.error('Error fetching basketball roles:', error);
      return [];
    }

    return (
      data?.map(role => ({
        id: role.id,
        personId: role.person_id,
        roleType: role.role_type as BasketballRoleType,
        organizationId: role.organization_id,
        teamId: role.team_id,
        createdAt: new Date(role.created_at),
        updatedAt: role.updated_at ? new Date(role.updated_at) : undefined,
      })) || []
    );
  } catch (error) {
    console.error('Error in getBasketballRoles:', error);
    return [];
  }
}

/**
 * Check if a person has a specific basketball role
 */
export async function hasBasketballRole(
  personId: string,
  roleType: BasketballRoleType,
  teamId?: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    let query = supabase
      .from('mpbc_person_role')
      .select('id')
      .eq('person_id', personId)
      .eq('role_type', roleType);

    if (teamId) {
      query = query.eq('team_id', teamId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking basketball role:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error in hasBasketballRole:', error);
    return false;
  }
}
