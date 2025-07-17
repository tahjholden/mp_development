import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { requireCapability } from '@/lib/db/user-service';
import { Capability } from '@/lib/db/role-types';
import { z } from 'zod';

// Schema for validating organization creation request
const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  website: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    // Check if user has capability to manage organizations
    await requireCapability(Capability.MANAGE_ORGANIZATIONS);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createOrganizationSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          error:
            validationResult.error.errors[0]?.message || 'Invalid request data',
        },
        { status: 400 }
      );
    }

    const { name, description, website } = validationResult.data;

    // Create the organization record
    const [organization] = await db
      .insert({
        tableName: 'mp_core_organizations',
        values: {
          name,
          description: description || null,
          website: website || null,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      })
      .returning();

    if (!organization) {
      return Response.json(
        { error: 'Failed to create organization record' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        website: organization.website,
      },
    });
  } catch (error) {
    // Handle error silently
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create organization',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if user has capability to manage organizations
    await requireCapability(Capability.MANAGE_ORGANIZATIONS);

    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Query for organizations
    const organizations = await db.select({
      tableName: 'mp_core_organizations',
      columns: [
        'id',
        'name',
        'description',
        'website',
        'active',
        'created_at',
        'updated_at',
      ],
    });

    return Response.json(organizations);
  } catch (error) {
    // Handle error silently
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch organizations',
      },
      { status: 500 }
    );
  }
}
