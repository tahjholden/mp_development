import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson, mpbcPersonGroup } from '@/lib/db/schema';
import { requireCapability } from '@/lib/db/user-service';
import { Capability } from '@/lib/db/role-types';
import { z } from 'zod';

// Schema for validating coach creation request
const createCoachSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  teamId: z.string().min(1, "Team ID is required"),
  organizationId: z.string().optional(),
  isAdmin: z.boolean().optional().default(false),
  isSuperAdmin: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    // Check if user has capability to manage coaches
    await requireCapability(Capability.MANAGE_COACHES);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createCoachSchema.safeParse(body);
    
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0]?.message || 'Invalid request data' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, teamId, organizationId, isAdmin, isSuperAdmin } = validationResult.data;

    // Use the user's organization if not provided
    const orgId = organizationId || user.organizationId;

    // Determine the person type based on admin flags
    let personType = 'coach';
    if (isSuperAdmin) {
      personType = 'superadmin';
    } else if (isAdmin) {
      personType = 'admin';
    }

    // Create the mpbc_person record
    const [coach] = await db
      .insert(mpbcPerson)
      .values({
        firstName,
        lastName,
        email,
        personType,
        organizationId: orgId,
        active: true,
      })
      .returning();

    if (!coach) {
      return Response.json(
        { error: 'Failed to create coach record' },
        { status: 500 }
      );
    }

    // Associate the coach with the team
    const [membership] = await db
      .insert(mpbcPersonGroup)
      .values({
        personId: coach.id,
        groupId: teamId,
        role: 'coach',
        status: 'active',
      })
      .returning();

    if (!membership) {
      return Response.json(
        { error: 'Failed to associate coach with team' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      coach: {
        id: coach.id,
        name: `${firstName} ${lastName}`.trim(),
        email,
        teamId,
        personType,
        isAdmin: isAdmin || isSuperAdmin,
        isSuperAdmin,
      }
    });
  } catch (error) {
    console.error('Error creating coach:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create coach' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if user has capability to view coaches
    await requireCapability(Capability.MANAGE_COACHES);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Query for coaches
    const coaches = await db
      .select({
        id: mpbcPerson.id,
        firstName: mpbcPerson.firstName,
        lastName: mpbcPerson.lastName,
        email: mpbcPerson.email,
        personType: mpbcPerson.personType,
        organizationId: mpbcPerson.organizationId,
        active: mpbcPerson.active,
        createdAt: mpbcPerson.createdAt,
      })
      .from(mpbcPerson)
      .where(db.or(
        db.eq(mpbcPerson.personType, 'coach'),
        db.eq(mpbcPerson.personType, 'admin'),
        db.eq(mpbcPerson.personType, 'superadmin')
      ));

    // Transform the data to match the expected format
    const formattedCoaches = coaches.map(coach => ({
      id: coach.id,
      name: `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'Unknown Coach',
      email: coach.email,
      personType: coach.personType,
      organizationId: coach.organizationId,
      active: coach.active,
      createdAt: coach.createdAt,
    }));

    return Response.json(formattedCoaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}