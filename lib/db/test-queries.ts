import { db } from './drizzle';
import { eq, sql } from 'drizzle-orm';
import { mpCorePerson } from './schema';

/**
 * Get counts of various entities in the database
 */
export async function getDatabaseCounts() {
  if (!db) {
    return {
      userCount: 0,
    };
  }

  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mpCorePerson);

  return {
    userCount: userCount?.count || 0,
  };
}

/**
 * Get a list of users with pagination
 */
export async function getUsers(limit = 10, offset = 0) {
  if (!db) {
    return [];
  }

  return db
    .select({
      id: mpCorePerson.id,
      firstName: mpCorePerson.firstName,
      lastName: mpCorePerson.lastName,
      email: mpCorePerson.email,
      personType: mpCorePerson.personType,
    })
    .from(mpCorePerson)
    .limit(limit)
    .offset(offset);
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string) {
  if (!db) {
    return null;
  }

  const result = await db
    .select({
      id: mpCorePerson.id,
      firstName: mpCorePerson.firstName,
      lastName: mpCorePerson.lastName,
      email: mpCorePerson.email,
      personType: mpCorePerson.personType,
    })
    .from(mpCorePerson)
    .where(eq(mpCorePerson.id, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string, limit = 10) {
  if (!db) {
    return [];
  }

  return db
    .select({
      id: mpCorePerson.id,
      firstName: mpCorePerson.firstName,
      lastName: mpCorePerson.lastName,
      email: mpCorePerson.email,
      personType: mpCorePerson.personType,
    })
    .from(mpCorePerson)
    .where(
      sql`${mpCorePerson.firstName} ILIKE ${`%${query}%`} OR ${mpCorePerson.lastName} ILIKE ${`%${query}%`} OR ${mpCorePerson.email} ILIKE ${`%${query}%`}`
    )
    .limit(limit);
}
