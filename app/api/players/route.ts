import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup } from '@/lib/db/schema';
import { requireCapability } from '@/lib/db/user-service';
import { Capability } from '@/lib/db/role-types';
import { z } from 'zod';

// Schema for validating player creation request
const createPlayerSchema = z.object({
  name: z.string().min(1, "Player name is required"),
  email: z.string().email("Valid email is required"),
  teamId: z.string().min(1, "Team ID is required"),
  organizationId: z.string().optional(),
  position: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Check if user has capability to add players
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
    const validationResult = createPlayerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0]?.message || 'Invalid request data' },
        { status: 400 }
      );
    }

    const { name, email, teamId, organizationId, position } = validationResult.data;

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Use the user's organization if not provided
    const orgId = organizationId || user.organizationId;

    // Create the mpbc_person record directly
    const [player] = await db
      .insert(mpbcPerson)
      .values({
        email,
        firstName,
        lastName,
        personType: 'player',
        organizationId: orgId,
      })
      .returning();

    if (!player) {
      return Response.json(
        { error: 'Failed to create player record' },
        { status: 500 }
      );
    }

    // Finally, associate the player with the team
    const [membership] = await db
      .insert(mpbcPersonGroup)
      .values({
        personId: player.id,
        groupId: teamId,
        role: 'player',
        position: position || null,
        status: 'active',
      })
      .returning();

    if (!membership) {
      return Response.json(
        { error: 'Failed to associate player with team' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      player: {
        id: player.id,
        name: `${firstName} ${lastName}`.trim(),
        email,
        teamId,
        position: position || null,
      }
    });
  } catch (error) {
    console.error('Error creating player:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create player' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Check if user has capability to view players
    await requireCapability(Capability.VIEW_TEAM_PLAYERS);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Redirect to the dashboard players endpoint for now
    // In the future, you might want to implement a different logic here
    return Response.redirect(new URL('/api/dashboard/players', req.url));
  } catch (error) {
    console.error('Error fetching players:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch players' },
      { status: 500 }
    );
  }
}