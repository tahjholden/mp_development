import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import {
  infrastructureActivityLogs,
  mpCorePerson,
  mpCorePersonGroup,
  mpCoreGroup,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser(): Promise<
  typeof mpCorePerson.$inferSelect | null
> {
  // Database might be undefined in environments without POSTGRES_URL.
  if (!db) {
    console.log('getUser: Database not available');
    return null;
  }

  const sessionCookie = (await cookies()).get('session');
  console.log('getUser: Session cookie exists:', !!sessionCookie);
  if (!sessionCookie || !sessionCookie.value) {
    console.log('getUser: No session cookie or value');
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  console.log('getUser: Session data:', sessionData ? 'valid' : 'invalid');
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string' // UUIDs are strings
  ) {
    console.log('getUser: Invalid session data');
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    console.log('getUser: Session expired');
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

  if (!userResult.length || !userResult[0]) return null;

  const user = userResult[0];

  // Get the user's team information from mpCorePersonGroup
  const teamResult = await db
    .select({
      groupId: mpCorePersonGroup.groupId,
      groupName: mpCoreGroup.name,
    })
    .from(mpCorePersonGroup)
    .leftJoin(mpCoreGroup, eq(mpCorePersonGroup.groupId, mpCoreGroup.id))
    .where(eq(mpCorePersonGroup.personId, personId))
    .limit(1);

  const team = teamResult.length > 0 ? teamResult[0] : null;

  return {
    ...user,
    team: team
      ? {
          id: team.groupId,
          name: team.groupName,
        }
      : null,
    teamId: team?.groupId || null,
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
      id: infrastructureActivityLogs.id,
      action: infrastructureActivityLogs.action,
      timestamp: infrastructureActivityLogs.timestamp,
      ipAddress: infrastructureActivityLogs.ipAddress,
      userName: mpCorePerson.firstName,
    })
    .from(infrastructureActivityLogs)
    .leftJoin(
      mpCorePerson,
      eq(infrastructureActivityLogs.personId, mpCorePerson.id)
    )
    .where(eq(infrastructureActivityLogs.personId, user.id))
    .orderBy(desc(infrastructureActivityLogs.timestamp))
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

  // Get the user's team information from mpCorePersonGroup
  const teamResult = await db
    .select({
      groupId: mpCorePersonGroup.groupId,
      groupName: mpCoreGroup.name,
    })
    .from(mpCorePersonGroup)
    .leftJoin(mpCoreGroup, eq(mpCorePersonGroup.groupId, mpCoreGroup.id))
    .where(eq(mpCorePersonGroup.personId, user.id))
    .limit(1);

  if (teamResult.length > 0 && teamResult[0]) {
    const team = teamResult[0];
    return {
      id: team.groupId,
      name: team.groupName || null,
      // Add other team properties as needed
    };
  }

  return null;
}
