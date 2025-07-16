import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup, mpbcGroup } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // If no user session, still fetch data for development
    if (!user) {
      // No user session found, fetching all teams for development
    }

    // Get teams by joining with mpbcPersonGroup and mpbcGroup tables
    // Only show teams where the person has role = 'coach'
    const teams = await db
      .select({
        id: mpbcGroup.id,
        name: mpbcGroup.name,
        coachName: mpbcPerson.firstName,
        coachLastName: mpbcPerson.lastName,
        role: mpbcPersonGroup.role,
        personType: mpbcPerson.personType,
      })
      .from(mpbcPersonGroup)
      .leftJoin(mpbcGroup, eq(mpbcPersonGroup.groupId, mpbcGroup.id))
      .leftJoin(mpbcPerson, eq(mpbcPersonGroup.personId, mpbcPerson.id))
      .where(
        and(
          isNotNull(mpbcGroup.id),
          isNotNull(mpbcGroup.name),
          eq(mpbcPersonGroup.role, 'coach')
        )
      )
      .groupBy(
        mpbcGroup.id,
        mpbcGroup.name,
        mpbcPerson.firstName,
        mpbcPerson.lastName,
        mpbcPersonGroup.role,
        mpbcPerson.personType
      );

    // Transform the data to match the expected format
    const formattedTeams = teams.map(team => {
      const coachName =
        team.coachName && team.coachLastName
          ? `${team.coachName} ${team.coachLastName}`.trim()
          : team.coachName || team.coachLastName || 'Unknown Coach';

      return {
        id: team.id || 'unknown',
        name: team.name || 'Unknown Team',
        coachName,
        role: team.role || 'Coach',
        personType: team.personType || 'coach',
      };
    });

    return Response.json(formattedTeams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
