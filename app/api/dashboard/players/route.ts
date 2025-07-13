import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      console.log('No user found, returning mock players for development');
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
      ];
      return Response.json(mockPlayers);
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get all players from the current_participants table
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
      .where(
        and(
          eq(mpCorePerson.personType, 'player'),
          isNotNull(mpCorePerson.groupId)
        )
      );

    // Transform the data to match the expected format for the dashboard
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: player.name && player.lastName 
        ? `${player.name} ${player.lastName}`.trim()
        : player.name || player.lastName || 'Unknown Player',
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
    const uniquePlayers = formattedPlayers.filter((player, index, self) => 
      index === self.findIndex(p => p.id === player.id)
    );

    console.log(`Found ${players.length} players, ${uniquePlayers.length} unique players`);
    if (players.length !== uniquePlayers.length) {
      console.log('Duplicate IDs found:', players.map(p => p.id).filter((id, index, arr) => arr.indexOf(id) !== index));
    }

    return Response.json(uniquePlayers);
  } catch (error) {
    console.error('Error fetching dashboard players:', error);
    return Response.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
} 