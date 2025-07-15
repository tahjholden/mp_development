import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup, mpbcGroup } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    const { id: teamId } = await params;

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // If no user session, still fetch data for development
    if (!user) {
      console.log(
        'No user session found, fetching team players for development'
      );
    }

    // Get all players for the specific team using mpbc_person_group.role = 'player' as source of truth
    const players = await db
      .select({
        id: mpbcPerson.id,
        firstName: mpbcPerson.firstName,
        lastName: mpbcPerson.lastName,
        email: mpbcPerson.email,
        teamId: mpbcGroup.id,
        teamName: mpbcGroup.name,
        position: mpbcPersonGroup.position,
        role: mpbcPersonGroup.role,
        personType: mpbcPerson.personType,
        identifier: mpbcPersonGroup.identifier,
        cycleName: mpbcPersonGroup.cycleId,
        status: mpbcPersonGroup.status,
      })
      .from(mpbcPerson)
      .innerJoin(mpbcPersonGroup, eq(mpbcPerson.id, mpbcPersonGroup.personId))
      .innerJoin(mpbcGroup, eq(mpbcPersonGroup.groupId, mpbcGroup.id))
      .where(
        and(
          eq(mpbcPersonGroup.groupId, teamId),
          eq(mpbcPersonGroup.role, 'player')
        )
      );

    // Transform the data to match the expected format
    const formattedPlayers = players.map(player => ({
      id: player.id,
      displayName:
        player.firstName && player.lastName
          ? `${player.firstName} ${player.lastName}`.trim()
          : player.firstName || player.lastName || 'Unknown Player',
      teamId: player.teamId,
      teamName: player.teamName,
      personType: player.personType || 'player',
      position: player.position || 'Unknown',
      status: player.status || 'active',
      email: player.email,
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
