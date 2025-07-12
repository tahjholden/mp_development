import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  mpCorePerson,
  Person,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser(): Promise<Person | null> {
  // Database might be undefined in environments without POSTGRES_URL.
  if (!db) {
    return null;
  }

  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string' // UUIDs are strings
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const userResult = await db
    .select()
    .from(mpCorePerson)
    .where(eq(mpCorePerson.id, sessionData.user.id))
    .limit(1);

  if (userResult.length === 0) {
    return null;
  }

  return userResult[0];
}

export async function getUserWithTeam(personId: string) {
  if (!db) {
    return null;
  }

  const userResult = await db
    .select()
    .from(mpCorePerson)
    .where(eq(mpCorePerson.id, personId))
    .limit(1);

  if (!userResult.length) return null;

  const user = userResult[0];

  return {
    ...user,
    team: user.groupId && user.groupName ? {
      id: user.groupId,
      name: user.groupName,
    } : null,
    teamId: user.groupId,
  };
}

export async function getActivityLogs() {
  if (!db) {
    throw new Error('Database unavailable');
  }

  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: mpCorePerson.firstName,
    })
    .from(activityLogs)
    .leftJoin(mpCorePerson, eq(activityLogs.personId, mpCorePerson.id))
    .where(eq(activityLogs.personId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  if (!db) {
    return null;
  }

  const user = await getUser();
  if (!user) {
    return null;
  }

  // For now, return null since the team tables don't exist in the current schema
  // The user's team information is stored in groupId and groupName fields
  if (user.groupId && user.groupName) {
    return {
      id: user.groupId,
      name: user.groupName,
      // Add other team properties as needed
    };
  }

  return null;
}
