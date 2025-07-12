import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get players for the specific team from the current_participants table
    const players = await db
      .select({
        id: mpCorePerson.id,
        name: mpCorePerson.firstName,
        lastName: mpCorePerson.lastName,
        email: mpCorePerson.email,
        teamId: mpCorePerson.groupId,
        teamName: mpCorePerson.groupName,
        position: mpCorePerson.position,
        role: mpCorePerson.role,
        personType: mpCorePerson.personType,
        identifier: mpCorePerson.identifier,
        cycleName: mpCorePerson.cycleName,
      })
      .from(mpCorePerson)
      .where(eq(mpCorePerson.groupId, teamId));

    // Transform the data to match the expected format
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: player.name && player.lastName 
        ? `${player.name} ${player.lastName}`.trim()
        : player.name || player.lastName || 'Unknown Player',
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
    return Response.json({ error: 'Failed to fetch team players' }, { status: 500 });
  }
} 