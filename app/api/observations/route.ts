import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpbc_observations } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Fetch real observations joined with player info
    const results = await db
      .select({
        id: mpbc_observations.id,
        playerId: mpCorePerson.id,
        playerName: mpCorePerson.firstName,
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
      .where(eq(mpCorePerson.personType, 'player'));

    // Map tags and other fields if needed
    const observations = results.map(obs => ({
      ...obs,
      tags: obs.tags ? obs.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      rating: typeof obs.rating === 'number' ? obs.rating : 0,
      playerName: obs.playerName || '',
      title: obs.title || '',
      description: obs.description || '',
    }));

    return NextResponse.json(observations);
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
