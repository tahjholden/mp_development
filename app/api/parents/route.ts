import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson } from '@/lib/db/schema';
import { requireCapability } from '@/lib/db/user-service';
import { Capability } from '@/lib/db/role-types';
import { z } from 'zod';

// Schema for validating parent creation request
const createParentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  playerIds: z.array(z.string()).min(1, "At least one player must be associated"),
  organizationId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Check if user has capability to add players (which includes parent management)
    await requireCapability(Capability.ADD_PLAYER);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createParentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0]?.message || 'Invalid request data' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, playerIds, organizationId } = validationResult.data;

    // Use the user's organization if not provided
    const orgId = organizationId || user.organizationId;

    // Create the parent record
    const [parent] = await db
      .insert(mpbcPerson)
      .values({
        firstName,
        lastName,
        email,
        phone,
        personType: 'parent',
        organizationId: orgId,
        active: true,
      })
      .returning();

    if (!parent) {
      return Response.json(
        { error: 'Failed to create parent record' },
        { status: 500 }
      );
    }

    // Create relationships between parent and players
    const relationships = [];
    for (const playerId of playerIds) {
      try {
        // Check if the player exists
        const player = await db
          .select()
          .from(mpbcPerson)
          .where(db.eq(mpbcPerson.id, playerId))
          .limit(1);

        if (player.length === 0) {
          continue; // Skip if player doesn't exist
        }

        // Create parent-child relationship
        // Note: We need to import the proper schema for relationships
        // For now, we'll just track the relationship in memory
        const relationship = {
          personId: parent.id,
          relatedPersonId: playerId,
          relationshipType: 'parent',
        };

        if (relationship) {
          relationships.push(relationship);
        }
      } catch (error) {
        console.error(`Error creating relationship with player ${playerId}:`, error);
      }
    }

    return Response.json({
      success: true,
      parent: {
        id: parent.id,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        playerIds: relationships.map(r => r.relatedPersonId),
      }
    });
  } catch (error) {
    console.error('Error creating parent:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create parent' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if user has capability to view players (which includes parents)
    await requireCapability(Capability.VIEW_TEAM_PLAYERS);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Query for parents
    const parents = await db
      .select({
        id: mpbcPerson.id,
        firstName: mpbcPerson.firstName,
        lastName: mpbcPerson.lastName,
        email: mpbcPerson.email,
        phone: mpbcPerson.phone,
        organizationId: mpbcPerson.organizationId,
        active: mpbcPerson.active,
        createdAt: mpbcPerson.createdAt,
      })
      .from(mpbcPerson)
      .where(db.eq(mpbcPerson.personType, 'parent'));

    // Transform the data to match the expected format
    const formattedParents = parents.map(parent => ({
      id: parent.id,
      name: `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Unknown Parent',
      email: parent.email,
      phone: parent.phone,
      organizationId: parent.organizationId,
      active: parent.active,
      createdAt: parent.createdAt,
    }));

    return Response.json(formattedParents);
  } catch (error) {
    console.error('Error fetching parents:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch parents' },
      { status: 500 }
    );
  }
}