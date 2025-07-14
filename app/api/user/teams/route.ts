import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpCorePersonGroup, mpCoreGroup } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    console.log('getUser result:', user);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Get teams by joining with mpCorePersonGroup and mpCoreGroup tables
    const teams = await db
      .select({
        id: mpCoreGroup.id,
        name: mpCoreGroup.name,
        coachName: mpCorePerson.firstName,
        coachLastName: mpCorePerson.lastName,
        role: mpCorePersonGroup.role,
        personType: mpCorePerson.personType,
      })
      .from(mpCorePersonGroup)
      .leftJoin(mpCoreGroup, eq(mpCorePersonGroup.groupId, mpCoreGroup.id))
      .leftJoin(mpCorePerson, eq(mpCorePersonGroup.personId, mpCorePerson.id))
      .where(and(isNotNull(mpCoreGroup.id), isNotNull(mpCoreGroup.name)))
      .groupBy(
        mpCoreGroup.id,
        mpCoreGroup.name,
        mpCorePerson.firstName,
        mpCorePerson.lastName,
        mpCorePersonGroup.role,
        mpCorePerson.personType
      );

    console.log('Raw teams data:', teams);

    // Transform the data to match the expected format
    const formattedTeams = teams.map(team => ({
      id: team.id || 'unknown',
      name: team.name || 'Unknown Team',
      coachName:
        team.coachName && team.coachLastName
          ? `${team.coachName} ${team.coachLastName}`.trim()
          : team.coachName || team.coachLastName || 'Unknown Coach',
      role: team.role || 'member',
      personType: team.personType || 'player',
      createdAt: new Date().toISOString(), // Since we don't have this in the current schema
      updatedAt: new Date().toISOString(), // Since we don't have this in the current schema
      // Add analytics fields with default values
      performance: 75, // Default performance score
      attendance: 85, // Default attendance rate
      players: 12, // Default number of players
    }));

    console.log('Formatted teams data:', formattedTeams);

    return Response.json(formattedTeams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
