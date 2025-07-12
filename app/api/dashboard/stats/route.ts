import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get players count
    const playersResult = await db
      .select({ count: mpCorePerson.id })
      .from(mpCorePerson)
      .where(
        and(
          eq(mpCorePerson.personType, 'player'),
          isNotNull(mpCorePerson.groupId)
        )
      );

    const totalPlayers = playersResult.length;

    // Get teams count (unique groupId/groupName combinations)
    const teamsResult = await db
      .select({
        groupId: mpCorePerson.groupId,
        groupName: mpCorePerson.groupName,
      })
      .from(mpCorePerson)
      .where(
        and(
          isNotNull(mpCorePerson.groupId),
          isNotNull(mpCorePerson.groupName)
        )
      )
      .groupBy(mpCorePerson.groupId, mpCorePerson.groupName);

    const activeTeams = teamsResult.length;

    // For now, return mock data for sessions and drills since we don't have those tables yet
    const stats = {
      totalPlayers,
      activeTeams,
      upcomingSessions: 5, // Mock data
      totalDrills: 12, // Mock data
      changes: {
        players: '+2',
        teams: '+1',
        sessions: '+3',
        drills: '+4',
      },
    };

    return Response.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 