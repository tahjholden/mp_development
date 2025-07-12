import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // For now, return empty array since we don't have a development_plans table
    // In a real implementation, you would query the development_plans table
    // This could be extended to create the table and store real development plans
    
    // Get players that could have development plans
    const players = await db
      .select({
        id: mpCorePerson.id,
        firstName: mpCorePerson.firstName,
        lastName: mpCorePerson.lastName,
        email: mpCorePerson.email,
        teamId: mpCorePerson.groupId,
        teamName: mpCorePerson.groupName,
        position: mpCorePerson.position,
        role: mpCorePerson.role,
        personType: mpCorePerson.personType,
      })
      .from(mpCorePerson)
      .where(
        and(
          eq(mpCorePerson.personType, 'player'),
          isNotNull(mpCorePerson.groupId)
        )
      );

    // Return empty array for now - this would be replaced with actual development plans
    // when the development_plans table is created
    const developmentPlans: any[] = [];

    return Response.json(developmentPlans);
  } catch (error) {
    console.error('Error fetching development plans:', error);
    return Response.json({ error: 'Failed to fetch development plans' }, { status: 500 });
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
      id: 'temp-id-' + Date.now()
    });
  } catch (error) {
    console.error('Error creating development plan:', error);
    return Response.json({ error: 'Failed to create development plan' }, { status: 500 });
  }
}
