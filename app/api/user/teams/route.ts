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

    // Get teams based on the user's groupId and groupName
    // Since teams are stored as groupId/groupName in the current_participants table
    const teams = await db
      .select({
        id: mpCorePerson.groupId,
        name: mpCorePerson.groupName,
        coachName: mpCorePerson.firstName,
        coachLastName: mpCorePerson.lastName,
        role: mpCorePerson.role,
        personType: mpCorePerson.personType,
      })
      .from(mpCorePerson)
      .where(
        and(
          isNotNull(mpCorePerson.groupId),
          isNotNull(mpCorePerson.groupName)
        )
      )
      .groupBy(mpCorePerson.groupId, mpCorePerson.groupName, mpCorePerson.firstName, mpCorePerson.lastName, mpCorePerson.role, mpCorePerson.personType);

    // Transform the data to match the expected format
    const formattedTeams = teams.map(team => ({
      id: team.id || 'unknown',
      name: team.name || 'Unknown Team',
      coachName: team.coachName && team.coachLastName 
        ? `${team.coachName} ${team.coachLastName}`.trim()
        : team.coachName || team.coachLastName || 'Unknown Coach',
      role: team.role || 'member',
      personType: team.personType || 'player',
      createdAt: new Date().toISOString(), // Since we don't have this in the current schema
      updatedAt: new Date().toISOString(), // Since we don't have this in the current schema
    }));

    return Response.json(formattedTeams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return Response.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
} 