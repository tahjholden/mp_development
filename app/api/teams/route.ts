import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpCorePersonGroup, mpCoreGroup } from '@/lib/db/schema';
import { and, isNotNull, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Get all teams from the normalized schema
    const teams = await db
      .select({
        id: mpCoreGroup.id,
        name: mpCoreGroup.name,
        coachFirstName: mpCorePerson.firstName,
        coachLastName: mpCorePerson.lastName,
        role: mpCorePersonGroup.role,
        personType: mpCorePerson.personType,
        email: mpCorePerson.email,
      })
      .from(mpCoreGroup)
      .innerJoin(
        mpCorePersonGroup,
        eq(mpCoreGroup.id, mpCorePersonGroup.groupId)
      )
      .innerJoin(mpCorePerson, eq(mpCorePersonGroup.personId, mpCorePerson.id))
      .where(
        and(isNotNull(mpCorePersonGroup.groupId), isNotNull(mpCoreGroup.name))
      )
      .groupBy(
        mpCoreGroup.id,
        mpCoreGroup.name,
        mpCorePerson.firstName,
        mpCorePerson.lastName,
        mpCorePersonGroup.role,
        mpCorePerson.personType,
        mpCorePerson.email
      );

    // Transform the data to match the expected format
    const formattedTeams = teams.map(team => ({
      id: team.id || 'unknown',
      name: team.name || 'Unknown Team',
      coachName:
        team.coachFirstName && team.coachLastName
          ? `${team.coachFirstName} ${team.coachLastName}`.trim()
          : team.coachFirstName || team.coachLastName || 'Unknown Coach',
      role: team.role || 'member',
      personType: team.personType || 'player',
      email: team.email,
      createdAt: new Date().toISOString(), // Since we don't have this in the current schema
      updatedAt: new Date().toISOString(), // Since we don't have this in the current schema
    }));

    return Response.json(formattedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
