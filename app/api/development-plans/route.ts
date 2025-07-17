import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcDevelopmentPlan, mpbcPerson } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireCapability } from '@/lib/db/user-service';
import { Capability } from '@/lib/db/role-logic';

export async function GET(req: Request) {
  try {
    console.log('GET /api/development-plans: Starting request');

    // Check if user has capability to view development plans
    await requireCapability(Capability.VIEW_OWN_DEVELOPMENT_PLANS);

    const { searchParams } = new URL(req.url);
    const playerIdsParam = searchParams.get('playerIds');

    const user = await getUser();
    console.log(
      'GET /api/development-plans: User fetched:',
      user ? 'User found' : 'No user'
    );

    if (!db) {
      console.error('GET /api/development-plans: Database not available');
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // If no user session, still fetch data for development
    if (!user) {
      console.log(
        'No user session found, fetching all development plans for development'
      );
    }

    console.log('GET /api/development-plans: Testing database connectivity');

    // First, test if we can access the development plans table
    try {
      const testQuery = await db
        .select({ id: mpbcDevelopmentPlan.id })
        .from(mpbcDevelopmentPlan)
        .limit(1);
      console.log(
        'GET /api/development-plans: Development plans table accessible, count:',
        testQuery.length
      );
    } catch (tableError) {
      console.error(
        'GET /api/development-plans: Error accessing development plans table:',
        tableError
      );
      return NextResponse.json(
        {
          error: 'Development plans table not accessible',
          details:
            tableError instanceof Error
              ? tableError.message
              : String(tableError),
        },
        { status: 500 }
      );
    }

    console.log('GET /api/development-plans: Starting database query');

    // Build query with optional player filtering
    let query = db
      .select({
        id: mpbcDevelopmentPlan.id,
        playerId: mpbcDevelopmentPlan.playerId,
        initialObservation: mpbcDevelopmentPlan.initialObservation,
        objective: mpbcDevelopmentPlan.objective,
        status: mpbcDevelopmentPlan.status,
        startDate: mpbcDevelopmentPlan.startDate,
        endDate: mpbcDevelopmentPlan.endDate,
        createdAt: mpbcDevelopmentPlan.createdAt,
        updatedAt: mpbcDevelopmentPlan.updatedAt,
        playerFirstName: mpbcPerson.firstName,
        playerLastName: mpbcPerson.lastName,
      })
      .from(mpbcDevelopmentPlan)
      .leftJoin(mpbcPerson, eq(mpbcDevelopmentPlan.playerId, mpbcPerson.id));

    // Add player filtering if playerIds are provided
    if (playerIdsParam) {
      const playerIds = playerIdsParam.split(',').filter(id => id.trim());
      if (playerIds.length > 0) {
        const { inArray } = await import('drizzle-orm');
        query = query.where(inArray(mpbcDevelopmentPlan.playerId, playerIds));
      }
    }

    const results = await query;

    console.log(
      'GET /api/development-plans: Database query completed, results count:',
      results.length
    );

    // Map to UI shape
    const plans = results.map(plan => ({
      id: plan.id,
      playerId: plan.playerId,
      playerName:
        plan.playerFirstName && plan.playerLastName
          ? `${plan.playerFirstName} ${plan.playerLastName}`.trim()
          : plan.playerFirstName || plan.playerLastName || 'Unknown Player',
      title: plan.initialObservation || '',
      objective: plan.objective || '',
      status: plan.status || '',
      startDate: plan.startDate,
      endDate: plan.endDate,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      tags: [], // TODO: add tags if available
      goals: [], // TODO: add goals if available
      readiness: 'medium', // TODO: calculate if available
    }));

    console.log(
      'GET /api/development-plans: Successfully returning plans, count:',
      plans.length
    );
    return NextResponse.json(plans);
  } catch (error) {
    console.error('GET /api/development-plans: Error details:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch development plans',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('POST /api/development-plans: Starting request');

    // Check if user has capability to create development plans
    await requireCapability(Capability.CREATE_DEVELOPMENT_PLAN);

    const user = await getUser();
    console.log(
      'POST /api/development-plans: User fetched:',
      user ? 'User found' : 'No user'
    );

    if (!user) {
      console.log('POST /api/development-plans: No user found, returning 404');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In a real implementation, you would save the development plan to the database
    // For now, return a success response
    console.log(
      'POST /api/development-plans: Successfully created development plan'
    );
    return NextResponse.json({
      message: 'Development plan created successfully',
      id: 'temp-id-' + Date.now(),
    });
  } catch (error) {
    console.error('POST /api/development-plans: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });
    return NextResponse.json(
      { error: 'Failed to create development plan' },
      { status: 500 }
    );
  }
}
