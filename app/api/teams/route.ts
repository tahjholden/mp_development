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
    // First, get unique teams
    const uniqueTeams = await db
      .select({
        id: mpbcGroup.id,
        name: mpbcGroup.name,
      })
      .from(mpbcGroup)
      .where(isNotNull(mpbcGroup.name))
      .groupBy(mpbcGroup.id, mpbcGroup.name);

    // Then, get coach information for each team (just the first coach for display purposes)
    const teamsWithCoaches = await Promise.all(
      uniqueTeams.map(async team => {
        const coachInfo = await db!
          .select({
            coachFirstName: mpbcPerson.firstName,
            coachLastName: mpbcPerson.lastName,
            role: mpbcPersonGroup.role,
            personType: mpbcPerson.personType,
            email: mpbcPerson.email,
          })
          .from(mpbcPersonGroup)
          .innerJoin(mpbcPerson, eq(mpbcPersonGroup.personId, mpbcPerson.id))
          .where(
            and(
              eq(mpbcPersonGroup.groupId, team.id),
              eq(mpbcPersonGroup.role, 'coach')
            )
          )
          .limit(1);

        const coach = coachInfo[0];
        const coachName =
          coach?.coachFirstName && coach?.coachLastName
            ? `${coach.coachFirstName} ${coach.coachLastName}`.trim()
            : coach?.coachFirstName || coach?.coachLastName || 'Unknown Coach';

        return {
          id: team.id || 'unknown',
          name: team.name || 'Unknown Team',
          coachName,
          role: coach?.role || 'Coach',
          personType: coach?.personType || 'coach',
          email: coach?.email,
        };
      })
    );

    // Sort teams alphabetically
    const formattedTeams = teamsWithCoaches.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return Response.json(formattedTeams);
  } catch {
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
