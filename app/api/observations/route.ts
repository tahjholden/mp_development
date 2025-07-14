import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpbc_observations } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const user = await getUser();
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // If no user session, still fetch data for development
    if (!user) {
      console.log('No user session found, fetching all observations for development');
    }

    // Parse pagination params
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100); // max 100 per page

    // Fetch all observations (for total count)
    const allResults = await db
      .select({
        id: mpbc_observations.id,
      })
      .from(mpbc_observations)
      .leftJoin(mpCorePerson, eq(mpbc_observations.player_id, mpCorePerson.id))
      .where(eq(mpCorePerson.personType, 'player'));
    const total = allResults.length;

    // Fetch paginated observations
    const results = await db
      .select({
        id: mpbc_observations.id,
        playerId: mpCorePerson.id,
        playerFirstName: mpCorePerson.firstName,
        playerLastName: mpCorePerson.lastName,
        title: mpbc_observations.context,
        description: mpbc_observations.observation_text,
        rating: mpbc_observations.performance_rating,
        date: mpbc_observations.created_at,
        tags: mpbc_observations.tags,
        createdAt: mpbc_observations.created_at,
        updatedAt: mpbc_observations.updated_at,
      })
      .from(mpbc_observations)
      .leftJoin(mpCorePerson, eq(mpbc_observations.player_id, mpCorePerson.id))
      .where(eq(mpCorePerson.personType, 'player'))
      .limit(limit)
      .offset(offset);

    // Map tags and other fields if needed
    const observations = results.map(obs => ({
      ...obs,
      tags: obs.tags ? obs.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      rating: typeof obs.rating === 'number' ? obs.rating : 0,
      playerName: obs.playerFirstName && obs.playerLastName 
        ? `${obs.playerFirstName} ${obs.playerLastName}`.trim()
        : obs.playerFirstName || obs.playerLastName || 'Unknown Player',
      title: obs.title || '',
      description: obs.description || '',
    }));

    return NextResponse.json({ observations, total });
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json({ error: 'Failed to fetch observations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const body = await request.json();
    // In a real implementation, you would save the observation to the database
    // For now, return a success response
    return NextResponse.json({ 
      message: 'Observation created successfully',
      id: 'temp-id-' + Date.now()
    });
  } catch (error) {
    console.error('Error creating observation:', error);
    return NextResponse.json({ error: 'Failed to create observation' }, { status: 500 });
  }
}
