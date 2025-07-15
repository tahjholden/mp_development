import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup, mpbcGroup } from '@/lib/db/schema';
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

    // Get all teams from the normalized schema using correct mpbc tables
    const teams = await db
      .select({
        id: mpbcGroup.id,
        name: mpbcGroup.name,
        coachFirstName: mpbcPerson.firstName,
        coachLastName: mpbcPerson.lastName,
        role: mpbcPersonGroup.role,
        personType: mpbcPerson.personType,
        email: mpbcPerson.email,
      })
      .from(mpbcGroup)
      .innerJoin(
        mpbcPersonGroup,
        eq(mpbcGroup.id, mpbcPersonGroup.groupId)
      )
      .innerJoin(mpbcPerson, eq(mpbcPersonGroup.personId, mpbcPerson.id))
      .where(
        and(isNotNull(mpbcPersonGroup.groupId), isNotNull(mpbcGroup.name))
      )
      .groupBy(
        mpbcGroup.id,
        mpbcGroup.name,
        mpbcPerson.firstName,
        mpbcPerson.lastName,
        mpbcPersonGroup.role,
        mpbcPerson.personType,
        mpbcPerson.email
      );

    // Transform the data to match the expected format
    const formattedTeams = teams.map(team => ({
      id: team.id || 'unknown',
      name: team.name || 'Unknown Team',
      coachName:
        team.coachFirstName && team.coachLastName
          ? `${team.coachFirstName} ${team.coachLastName}`.trim()
          : team.coachFirstName || team.coachLastName || 'Unknown Coach',
      role: team.role || 'Coach',
      personType: team.personType || 'coach',
      email: team.email,
    }));

    return Response.json(formattedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
