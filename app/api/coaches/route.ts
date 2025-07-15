import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup, mpbcGroup } from '@/lib/db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // If no user session, still fetch data for development (like players API does)
    if (!user) {
      console.log(
        'No user session found, fetching all coaches for development'
      );
    }

    // Query for coaches using mpbc_person_group.role = 'coach' as source of truth
    const coaches = await db
      .select({
        id: mpbcPerson.id,
        firstName: mpbcPerson.firstName,
        lastName: mpbcPerson.lastName,
        email: mpbcPerson.email,
        team: mpbcGroup.name,
        teamId: mpbcGroup.id,
        status: mpbcPersonGroup.status,
        role: mpbcPersonGroup.role,
        createdAt: mpbcPerson.createdAt,
        updatedAt: mpbcPerson.updatedAt,
        playerCount: sql<number>`
          (SELECT COUNT(*)::int 
           FROM ${mpbcPersonGroup} pg2
           WHERE pg2.group_id = ${mpbcPersonGroup.groupId} 
           AND pg2.role = 'player')
        `.as('player_count'),
      })
      .from(mpbcPerson)
      .innerJoin(mpbcPersonGroup, eq(mpbcPerson.id, mpbcPersonGroup.personId))
      .innerJoin(mpbcGroup, eq(mpbcPersonGroup.groupId, mpbcGroup.id))
      .where(
        and(
          isNotNull(mpbcPerson.id),
          isNotNull(mpbcPersonGroup.groupId),
          isNotNull(mpbcGroup.name),
          // Use role from mpbc_person_group as source of truth for coaches
          eq(mpbcPersonGroup.role, 'coach')
        )
      );

    // Transform to match frontend expectations
    const formattedCoaches = coaches.map(coach => ({
      id: coach.id,
      name: [coach.firstName, coach.lastName].filter(Boolean).join(' '),
      email: coach.email,
      team: coach.team,
      teamId: coach.teamId,
      status: coach.status || 'active',
      role: coach.role || 'Coach',
      experience: 0, // Placeholder, as experience is not in schema
      playerCount: coach.playerCount || 0,
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt,
    }));

    return Response.json(formattedCoaches);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}
