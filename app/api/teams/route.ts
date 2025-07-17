import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcGroup } from '@/lib/db/schema';
import { requireCapability } from '@/lib/db/user-service';
import { Capability } from '@/lib/db/role-types';
import { z } from 'zod';

// Schema for validating team creation request
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  organizationId: z.string().optional(),
  program: z.string().optional(),
  levelCategory: z.string().optional(),
  maxCapacity: z.number().optional(),
  active: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    // Check if user has capability to manage teams
    await requireCapability(Capability.MANAGE_TEAMS);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createTeamSchema.safeParse(body);
    
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0]?.message || 'Invalid request data' },
        { status: 400 }
      );
    }

    const { 
      name, 
      description, 
      organizationId, 
      program, 
      levelCategory, 
      maxCapacity, 
      active 
    } = validationResult.data;

    // Use the user's organization if not provided
    const orgId = organizationId || user.organizationId;

    // Create the team record
    const [team] = await db
      .insert(mpbcGroup)
      .values({
        name,
        description,
        organizationId: orgId,
        program,
        levelCategory,
        maxCapacity,
        active,
        groupType: 'team',
        createdBy: user.id,
      })
      .returning();

    if (!team) {
      return Response.json(
        { error: 'Failed to create team' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        organizationId: team.organizationId,
        program: team.program,
        levelCategory: team.levelCategory,
        maxCapacity: team.maxCapacity,
        active: team.active,
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json({ error: 'Database not available' }, { status: 500 });
    }

    // Query for teams
    const teams = await db
      .select()
      .from(mpbcGroup)
      .where(db.and(
        db.eq(mpbcGroup.groupType, 'team'),
        db.eq(mpbcGroup.organizationId, user.organizationId)
      ));

    // Transform the data to match the expected format
    const formattedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      program: team.program,
      levelCategory: team.levelCategory,
      maxCapacity: team.maxCapacity,
      active: team.active,
      organizationId: team.organizationId,
      createdAt: team.createdAt,
    }));

    return Response.json(formattedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}