import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  mpCorePerson,
  mpCoreGroup,
  mpCorePersonGroup,
  Person,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser(): Promise<Person | null> {
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
  const result = await db
    .select({
      person: mpCorePerson,
      group: mpCoreGroup,
    })
    .from(mpCorePerson)
    .leftJoin(mpCorePersonGroup, eq(mpCorePerson.id, mpCorePersonGroup.personId))
    .leftJoin(mpCoreGroup, eq(mpCorePersonGroup.groupId, mpCoreGroup.id))
    .where(eq(mpCorePerson.id, personId))
    .limit(1);

  if (!result.length) return null;

  return {
    ...result[0].person,
    team: result[0].group, // Keep 'team' property for compatibility for now
    teamId: result[0].group?.id, // Keep 'teamId' for compatibility
  };
}

export async function getActivityLogs() {
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
      userName: mpCorePerson.displayName,
    })
    .from(activityLogs)
    .leftJoin(mpCorePerson, eq(activityLogs.personId, mpCorePerson.id))
    .where(eq(activityLogs.personId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.mpCorePersonGroup.findFirst({
    where: eq(mpCorePersonGroup.personId, user.id),
    with: {
      group: {
        with: {
          members: {
            with: {
              person: {
                columns: {
                  id: true,
                  displayName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.group || null;
}
