import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup, mpbcGroup } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    // console.log('Dashboard stats API called');
    const user = await getUser();
    // console.log('User from getUser():', user ? user.email : 'null');

    if (!user) {
      // console.log('No user found, returning mock data for development');
      // For development, return mock data if no user is found
      const mockStats = {
        totalPlayers: 24,
        activeTeams: 3,
        upcomingSessions: 5,
        totalDrills: 12,
        changes: {
          players: '+2',
          teams: '+1',
          sessions: '+3',
          drills: '+4',
        },
      };
      return Response.json(mockStats);
    }

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Get players count using mpbc_person.person_type = 'player' as source of truth
    const playersResult = await db
      .select({ count: mpbcPerson.id })
      .from(mpbcPerson)
      .innerJoin(mpbcPersonGroup, eq(mpbcPerson.id, mpbcPersonGroup.personId))
      .where(
        and(
          eq(mpbcPerson.personType, 'player'),
          isNotNull(mpbcPersonGroup.groupId)
        )
      );
    const totalPlayers = playersResult.length;

    // Get teams count using mpbc_group
    const teamsResult = await db
      .select({ groupId: mpbcGroup.id, groupName: mpbcGroup.name })
      .from(mpbcGroup)
      .innerJoin(mpbcPersonGroup, eq(mpbcGroup.id, mpbcPersonGroup.groupId))
      .where(isNotNull(mpbcPersonGroup.groupId))
      .groupBy(mpbcGroup.id, mpbcGroup.name);
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
  } catch {
    // console.error('Error fetching dashboard stats:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
