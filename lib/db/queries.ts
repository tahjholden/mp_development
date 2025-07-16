import { desc, eq } from 'drizzle-orm';
import { db } from './drizzle';
import { infrastructureActivityLogs, currentParticipants } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser(): Promise<
  typeof currentParticipants.$inferSelect | null
> {
  return await getCurrentParticipant();
}

export async function getUserWithTeam(personId: string) {
  if (!db) {
    return null;
  }

  const userResult = await db
    .select()
    .from(currentParticipants)
    .where(eq(currentParticipants.id, personId))
    .limit(1);

  if (!userResult.length || !userResult[0]) return null;

  const user = userResult[0];

  return {
    ...user,
    team:
      user.groupId && user.groupName
        ? {
            id: user.groupId,
            name: user.groupName,
          }
        : null,
    teamId: user.groupId || null,
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
      userName: currentParticipants.firstName,
    })
    .from(infrastructureActivityLogs)
    .leftJoin(
      currentParticipants,
      eq(infrastructureActivityLogs.personId, currentParticipants.id)
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

  // The user data from current_participants already includes team information
  if (user.groupId && user.groupName) {
    return {
      id: user.groupId,
      name: user.groupName,
      // Add other team properties as needed
    };
  }

  return null;
}

// Function to get current participant data by ID
export async function getParticipantById(
  participantId: string
): Promise<typeof currentParticipants.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(currentParticipants)
    .where(eq(currentParticipants.id, participantId))
    .limit(1);

  return result[0] || null;
}

// Function to get current user's participant data from session
export async function getCurrentParticipant() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (!sessionData || !sessionData.user || !sessionData.user.mpbcPersonId) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  return await getParticipantById(sessionData.user.mpbcPersonId);
}
