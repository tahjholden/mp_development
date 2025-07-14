import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson, mpbcDevelopmentPlan } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();

    if (!db) {
      return Response.json(
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

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Fetch development plans and join with player info
    const results = await db
      .select({
        id: mpbcDevelopmentPlan.id,
        playerId: mpbcDevelopmentPlan.playerId,
        title: mpbcDevelopmentPlan.title,
        objective: mpbcDevelopmentPlan.objective,
        status: mpbcDevelopmentPlan.status,
        startDate: mpbcDevelopmentPlan.startDate,
        endDate: mpbcDevelopmentPlan.endDate,
        createdAt: mpbcDevelopmentPlan.createdAt,
        updatedAt: mpbcDevelopmentPlan.updatedAt,
        playerFirstName: mpCorePerson.firstName,
        playerLastName: mpCorePerson.lastName,
      })
      .from(mpbcDevelopmentPlan)
      .leftJoin(
        mpCorePerson,
        eq(mpbcDevelopmentPlan.playerId, mpCorePerson.id)
      );

    // Map to UI shape
    const plans = results.map(plan => ({
      id: plan.id,
      playerId: plan.playerId,
      playerName:
        plan.playerFirstName && plan.playerLastName
          ? `${plan.playerFirstName} ${plan.playerLastName}`.trim()
          : plan.playerFirstName || plan.playerLastName || 'Unknown Player',
      title: plan.title || '',
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

    return Response.json(plans);
  } catch (error) {
    console.error('Error fetching development plans:', error);
    return Response.json(
      { error: 'Failed to fetch development plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // In a real implementation, you would save the development plan to the database
    // For now, return a success response
    return Response.json({
      message: 'Development plan created successfully',
      id: 'temp-id-' + Date.now(),
    });
  } catch (error) {
    console.error('Error creating development plan:', error);
    return Response.json(
      { error: 'Failed to create development plan' },
      { status: 500 }
    );
  }
}
