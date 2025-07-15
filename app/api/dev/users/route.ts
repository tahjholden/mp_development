import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUsersByRole } from '@/lib/db/user-service';
import { PersonType } from '@/lib/db/role-logic';

export async function GET(request: NextRequest) {
  try {
    // Only allow superadmins to access this endpoint
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isSuperadmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Superadmin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as PersonType | null;
    const organizationId =
      searchParams.get('organizationId') || currentUser.organizationId;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch users based on role filter
    let users;
    if (role) {
      users = await getUsersByRole(role, organizationId, true); // includeInactive = true
    } else {
      // If no role specified, get a mix of different roles for simulation
      const [players, coaches, parents, admins] = await Promise.all([
        getUsersByRole(PersonType.PLAYER, organizationId, true),
        getUsersByRole(PersonType.COACH, organizationId, true),
        getUsersByRole(PersonType.PARENT, organizationId, true),
        getUsersByRole(PersonType.ADMIN, organizationId, true),
      ]);

      // Combine and limit results
      users = [...players, ...coaches, ...parents, ...admins].slice(
        offset,
        offset + limit
      );
    }

    // Filter out the current user to prevent self-impersonation
    users = users.filter(user => user.id !== currentUser.id);

    // Add simulation metadata
    const usersWithMetadata = users.map(user => ({
      ...user,
      simulationMetadata: {
        isDevSandbox:
          user.email?.includes('test') || user.email?.includes('dev'),
        canSimulate: true, // All users can be simulated in dev mode
        lastSimulated: null, // Could be tracked in the future
      },
    }));

    return NextResponse.json({
      users: usersWithMetadata,
      total: usersWithMetadata.length,
      currentUser: {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.primaryRole,
      },
    });
  } catch (error) {
    console.error('Error fetching users for simulation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users for simulation' },
      { status: 500 }
    );
  }
}
