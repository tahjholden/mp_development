import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpCorePersonGroup, mpCoreGroup } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: teamId } = await params;

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Get players for the specific team with their group/team info
    const players = await db
      .select({
        id: mpCorePerson.id,
        firstName: mpCorePerson.firstName,
        lastName: mpCorePerson.lastName,
        email: mpCorePerson.email,
        teamId: mpCoreGroup.id,
        teamName: mpCoreGroup.name,
        position: mpCorePersonGroup.position,
        role: mpCorePersonGroup.role,
        personType: mpCorePerson.personType,
        identifier: mpCorePersonGroup.identifier,
        cycleName: mpCorePersonGroup.cycleId, // or join to cycle table if needed
      })
      .from(mpCorePerson)
      .innerJoin(
        mpCorePersonGroup,
        eq(mpCorePerson.id, mpCorePersonGroup.personId)
      )
      .innerJoin(mpCoreGroup, eq(mpCorePersonGroup.groupId, mpCoreGroup.id))
      .where(
        and(
          eq(mpCorePersonGroup.groupId, teamId),
          eq(mpCorePerson.personType, 'player')
        )
      );

    // Transform the data to match the expected format
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name:
        player.firstName && player.lastName
          ? `${player.firstName} ${player.lastName}`.trim()
          : player.firstName || player.lastName || 'Unknown Player',
      teamId: player.teamId,
      teamName: player.teamName,
      position: player.position || 'Unknown',
      role: player.role || 'player',
      personType: player.personType || 'player',
      email: player.email,
      identifier: player.identifier,
      cycleName: player.cycleName,
      status: 'active', // Since we don't have status in the current schema
      createdAt: new Date().toISOString(), // Since we don't have this in the current schema
      updatedAt: new Date().toISOString(), // Since we don't have this in the current schema
    }));

    return Response.json(formattedPlayers);
  } catch (error) {
    console.error('Error fetching team players:', error);
    return Response.json(
      { error: 'Failed to fetch team players' },
      { status: 500 }
    );
  }
}
