import { db } from './drizzle';
import { eq, desc, sql, and } from 'drizzle-orm';
import {
  mpCorePerson,
  mpCoreGroup,
  mpCorePersonGroup,
  mpCoreOrganizations,
} from './schema';

// Infrastructure sessions table might not be in the schema.ts file yet
// so we'll define it here for the query
const infrastructureSessions = {
  id: 'id',
  groupId: 'group_id',
  sessionNumber: 'session_number',
  sessionType: 'session_type',
  date: 'date',
  startTime: 'start_time',
  endTime: 'end_time',
  location: 'location',
  status: 'status',
};

/**
 * Get counts of various entities in the database
 */
export async function getDatabaseCounts() {
  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mpCorePerson);

  const [groupCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mpCoreGroup);

  // For tables not in the schema.ts, we need to use a raw query
  const [sessionCount] = await db.execute<{ count: number }>(
    sql`SELECT COUNT(*) as count FROM infrastructure_sessions`
  );

  const [organizationCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mpCoreOrganizations);

  return {
    userCount: userCount.count,
    groupCount: groupCount.count,
    sessionCount: sessionCount.count,
    organizationCount: organizationCount.count,
  };
}

/**
 * Get a list of users with pagination
 */
export async function getUsers(limit = 10, offset = 0) {
  return db
    .select({
      id: mpCorePerson.id,
      displayName: mpCorePerson.displayName,
      email: mpCorePerson.email,
      isSuperadmin: mpCorePerson.isSuperadmin,
      createdAt: mpCorePerson.createdAt,
    })
    .from(mpCorePerson)
    .orderBy(desc(mpCorePerson.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get a list of groups with pagination
 */
export async function getGroups(limit = 10, offset = 0) {
  return db
    .select({
      id: mpCoreGroup.id,
      name: mpCoreGroup.name,
      createdAt: mpCoreGroup.createdAt,
    })
    .from(mpCoreGroup)
    .orderBy(desc(mpCoreGroup.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get a list of sessions with pagination
 */
export async function getSessions(limit = 10, offset = 0) {
  return db.execute<{
    id: string;
    groupId: string;
    sessionNumber: number;
    sessionType: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: string;
  }>(
    sql`SELECT 
      id, 
      group_id, 
      session_number, 
      session_type, 
      date, 
      start_time, 
      end_time, 
      location, 
      status 
    FROM infrastructure_sessions 
    ORDER BY date DESC 
    LIMIT ${limit} OFFSET ${offset}`
  );
}

/**
 * Get a user with their associated groups
 */
export async function getUserWithGroups(userId: string) {
  const user = await db
    .select({
      id: mpCorePerson.id,
      displayName: mpCorePerson.displayName,
      email: mpCorePerson.email,
    })
    .from(mpCorePerson)
    .where(eq(mpCorePerson.id, userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const groups = await db
    .select({
      id: mpCoreGroup.id,
      name: mpCoreGroup.name,
      role: mpCorePersonGroup.role,
      joinedAt: mpCorePersonGroup.joinedAt,
    })
    .from(mpCorePersonGroup)
    .innerJoin(mpCoreGroup, eq(mpCorePersonGroup.groupId, mpCoreGroup.id))
    .where(eq(mpCorePersonGroup.personId, userId));

  return {
    ...user[0],
    groups,
  };
}

/**
 * Get a group with its members
 */
export async function getGroupWithMembers(groupId: string) {
  const group = await db
    .select({
      id: mpCoreGroup.id,
      name: mpCoreGroup.name,
    })
    .from(mpCoreGroup)
    .where(eq(mpCoreGroup.id, groupId))
    .limit(1);

  if (group.length === 0) {
    return null;
  }

  const members = await db
    .select({
      id: mpCorePerson.id,
      displayName: mpCorePerson.displayName,
      email: mpCorePerson.email,
      role: mpCorePersonGroup.role,
      joinedAt: mpCorePersonGroup.joinedAt,
    })
    .from(mpCorePersonGroup)
    .innerJoin(mpCorePerson, eq(mpCorePersonGroup.personId, mpCorePerson.id))
    .where(eq(mpCorePersonGroup.groupId, groupId));

  return {
    ...group[0],
    members,
  };
}

/**
 * Get a list of organizations
 */
export async function getOrganizations(limit = 10, offset = 0) {
  return db
    .select({
      id: mpCoreOrganizations.id,
      name: mpCoreOrganizations.name,
      createdAt: mpCoreOrganizations.createdAt,
    })
    .from(mpCoreOrganizations)
    .orderBy(desc(mpCoreOrganizations.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get sessions for a specific group
 */
export async function getSessionsByGroup(groupId: string, limit = 10, offset = 0) {
  return db.execute<{
    id: string;
    sessionNumber: number;
    sessionType: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: string;
  }>(
    sql`SELECT 
      id, 
      session_number, 
      session_type, 
      date, 
      start_time, 
      end_time, 
      location, 
      status 
    FROM infrastructure_sessions 
    WHERE group_id = ${groupId}
    ORDER BY date DESC 
    LIMIT ${limit} OFFSET ${offset}`
  );
}

/**
 * Search for users by name or email
 */
export async function searchUsers(query: string, limit = 10) {
  return db
    .select({
      id: mpCorePerson.id,
      displayName: mpCorePerson.displayName,
      email: mpCorePerson.email,
    })
    .from(mpCorePerson)
    .where(
      sql`${mpCorePerson.displayName} ILIKE ${`%${query}%`} OR ${mpCorePerson.email} ILIKE ${`%${query}%`}`
    )
    .limit(limit);
}

/**
 * Search for groups by name
 */
export async function searchGroups(query: string, limit = 10) {
  return db
    .select({
      id: mpCoreGroup.id,
      name: mpCoreGroup.name,
    })
    .from(mpCoreGroup)
    .where(sql`${mpCoreGroup.name} ILIKE ${`%${query}%`}`)
    .limit(limit);
}
