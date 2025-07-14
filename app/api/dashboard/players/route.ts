import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpCorePersonGroup, mpCoreGroup } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '12', 10),
      100
    ); // max 100 per page

    const user = await getUser();
    if (!user) {
      // For development, return mock data if no user is found
      const mockPlayers = [
        {
          id: '1',
          name: 'John Smith',
          team: 'Varsity Boys',
          position: 'Point Guard',
          status: 'active',
          performance: {
            overall: 85,
            shooting: 88,
            defense: 82,
            ballHandling: 90,
          },
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          team: 'JV Girls',
          position: 'Shooting Guard',
          status: 'active',
          performance: {
            overall: 78,
            shooting: 85,
            defense: 75,
            ballHandling: 72,
          },
        },
        {
          id: '3',
          name: 'Mike Wilson',
          team: 'Varsity Boys',
          position: 'Center',
          status: 'active',
          performance: {
            overall: 82,
            shooting: 75,
            defense: 88,
            ballHandling: 70,
          },
        },
        {
          id: '4',
          name: 'Emily Davis',
          team: 'JV Girls',
          position: 'Power Forward',
          status: 'active',
          performance: {
            overall: 80,
            shooting: 78,
            defense: 85,
            ballHandling: 75,
          },
        },
        // Add more mock players for testing pagination
        ...Array.from({ length: 40 }, (_, i) => ({
          id: `${i + 5}`,
          name: `Mock Player ${i + 5}`,
          team: i % 2 === 0 ? 'Varsity Boys' : 'JV Girls',
          position: 'Unknown',
          status: 'active',
          performance: {
            overall: 70 + (i % 30),
            shooting: 70 + (i % 30),
            defense: 70 + (i % 30),
            ballHandling: 70 + (i % 30),
          },
        })),
      ];
      const total = mockPlayers.length;
      const paged = mockPlayers.slice(offset, offset + limit);
      return Response.json({ players: paged, total });
    }

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Get all players with their group/team info
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
          eq(mpCorePerson.personType, 'player'),
          isNotNull(mpCorePersonGroup.groupId)
        )
      );

    // Transform the data to match the expected format for the dashboard
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name:
        player.firstName && player.lastName
          ? `${player.firstName} ${player.lastName}`.trim()
          : player.firstName || player.lastName || 'Unknown Player',
      teamId: player.teamId,
      team: player.teamName || 'Unknown Team',
      position: player.position || 'Unknown',
      role: player.role || 'player',
      personType: player.personType || 'player',
      email: player.email,
      identifier: player.identifier,
      cycleName: player.cycleName,
      status: 'active', // Since we don't have status in the current schema
      performance: {
        overall: Math.floor(Math.random() * 40) + 60, // Mock performance data for now
        shooting: Math.floor(Math.random() * 40) + 60,
        defense: Math.floor(Math.random() * 40) + 60,
        ballHandling: Math.floor(Math.random() * 40) + 60,
      },
      createdAt: new Date().toISOString(), // Since we don't have this in the current schema
      updatedAt: new Date().toISOString(), // Since we don't have this in the current schema
    }));

    // Remove duplicates based on ID to prevent React key conflicts
    const uniquePlayers = formattedPlayers.filter(
      (player, index, self) => index === self.findIndex(p => p.id === player.id)
    );
    // Sort players alphabetically by name
    uniquePlayers.sort((a, b) => a.name.localeCompare(b.name));
    const total = uniquePlayers.length;
    const paged = uniquePlayers.slice(offset, offset + limit);

    return Response.json({ players: paged, total });
  } catch (error) {
    console.error('Error fetching dashboard players:', error);
    return Response.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}
