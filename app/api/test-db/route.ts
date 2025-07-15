import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup, mpbcGroup } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Check what data exists in the tables
    const allPersons = await db.select().from(mpbcPerson);
    const allPersonGroups = await db.select().from(mpbcPersonGroup);
    const allGroups = await db.select().from(mpbcGroup);

    // Check coaches specifically
    const coaches = await db
      .select({
        id: mpbcPerson.id,
        firstName: mpbcPerson.firstName,
        lastName: mpbcPerson.lastName,
        personType: mpbcPerson.personType,
        email: mpbcPerson.email,
      })
      .from(mpbcPerson)
      .where(eq(mpbcPerson.personType, 'coach'));

    // Check players specifically
    const players = await db
      .select({
        id: mpbcPerson.id,
        firstName: mpbcPerson.firstName,
        lastName: mpbcPerson.lastName,
        personType: mpbcPerson.personType,
        email: mpbcPerson.email,
      })
      .from(mpbcPerson)
      .where(eq(mpbcPerson.personType, 'player'));

    // Check person-group relationships
    const personGroups = await db
      .select({
        personId: mpbcPersonGroup.personId,
        groupId: mpbcPersonGroup.groupId,
        role: mpbcPersonGroup.role,
        personType: mpbcPerson.personType,
        firstName: mpbcPerson.firstName,
        lastName: mpbcPerson.lastName,
        groupName: mpbcGroup.name,
      })
      .from(mpbcPersonGroup)
      .innerJoin(mpbcPerson, eq(mpbcPersonGroup.personId, mpbcPerson.id))
      .innerJoin(mpbcGroup, eq(mpbcPersonGroup.groupId, mpbcGroup.id));

    return Response.json({
      summary: {
        totalPersons: allPersons.length,
        totalPersonGroups: allPersonGroups.length,
        totalGroups: allGroups.length,
        coaches: coaches.length,
        players: players.length,
        personGroupRelationships: personGroups.length,
      },
      coaches,
      players,
      personGroups,
      allPersons: allPersons.slice(0, 5), // First 5 for debugging
      allPersonGroups: allPersonGroups.slice(0, 5), // First 5 for debugging
      allGroups: allGroups.slice(0, 5), // First 5 for debugging
    });
  } catch (err) {
    return Response.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch test data',
      },
      { status: 500 }
    );
  }
}
