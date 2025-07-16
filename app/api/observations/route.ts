import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpbcObservations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const user = await getUser();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // If no user session, still fetch data for development
    if (!user) {
      console.log(
        'No user session found, fetching all observations for development'
      );
    }

    // Parse pagination params
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100
    ); // max 100 per page

    // Fetch all observations (for total count)
    const allResults = await db
      .select({
        id: mpbcObservations.id,
      })
      .from(mpbcObservations)
      .leftJoin(mpCorePerson, eq(mpbcObservations.playerId, mpCorePerson.id))
      .where(eq(mpCorePerson.personType, 'player'));
    const total = allResults.length;

    // Fetch paginated observations
    const results = await db
      .select({
        id: mpbcObservations.id,
        playerId: mpCorePerson.id,
        playerFirstName: mpCorePerson.firstName,
        playerLastName: mpCorePerson.lastName,
        title: mpbcObservations.context,
        description: mpbcObservations.observationText,
        rating: mpbcObservations.performanceRating,
        date: mpbcObservations.createdAt,
        tags: mpbcObservations.tags,
        createdAt: mpbcObservations.createdAt,
        updatedAt: mpbcObservations.updatedAt,
      })
      .from(mpbcObservations)
      .leftJoin(mpCorePerson, eq(mpbcObservations.playerId, mpCorePerson.id))
      .where(eq(mpCorePerson.personType, 'player'))
      .limit(limit)
      .offset(offset);

    // Map tags and other fields if needed
    const observations = results.map(obs => ({
      ...obs,
      tags: Array.isArray(obs.tags) ? obs.tags : [],
      rating: typeof obs.rating === 'number' ? obs.rating : 0,
      playerName:
        obs.playerFirstName && obs.playerLastName
          ? `${obs.playerFirstName} ${obs.playerLastName}`.trim()
          : obs.playerFirstName || obs.playerLastName || 'Unknown Player',
      title: obs.title || '',
      description: obs.description || '',
    }));

    return NextResponse.json({ observations, total });
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch observations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { context, observation_text, player_id, team_id, created_by } = body;

    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!context || !observation_text) {
      return NextResponse.json(
        { error: 'Context and observation text are required' },
        { status: 400 }
      );
    }

    // Validate context value
    if (context !== 'individual' && context !== 'team') {
      return NextResponse.json(
        { error: 'Context must be either "individual" or "team"' },
        { status: 400 }
      );
    }

    // Validate that we have the appropriate ID based on context
    if (context === 'individual' && !player_id) {
      return NextResponse.json(
        { error: 'Player ID is required for individual observations' },
        { status: 400 }
      );
    }

    if (context === 'team' && !team_id) {
      return NextResponse.json(
        { error: 'Team ID is required for team observations' },
        { status: 400 }
      );
    }

    // Insert the observation
    const result = await db
      .insert(mpbcObservations)
      .values({
        context: context,
        observationText: observation_text,
        playerId: context === 'individual' ? player_id : null,
        observerId: created_by,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: mpbcObservations.id });

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create observation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Observation created successfully',
      id: result[0].id,
    });
  } catch (error) {
    console.error('Error creating observation:', error);
    return NextResponse.json(
      { error: 'Failed to create observation' },
      { status: 500 }
    );
  }
}
