import { getCurrentUser } from '@/lib/db/user-service';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    // For development, return mock user data if no user is found
    const mockUser = {
      id: 'd827e98f-4fe0-4c9b-9c56-be2e728dafee',
      displayName: 'Tahj Holden',
      name: 'Tahj',
      email: 'tahjholden@gmail.com',
      role: 'coach',
      isSuperadmin: true,
      isAdmin: true,
      firstName: 'Tahj',
      lastName: 'Holden',
      personType: 'coach',
      organizationId: 'f1a2a396-1868-4530-8969-0b6bd54d1f4d',
      organizationName: 'MPBC',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authUid: 'b033cd64-701e-4f8b-ae54-44cabf92276b',
    };

    return Response.json(mockUser);
  }

  // Transform UnifiedUser to frontend format
  const transformedUser = {
    id: user.id,
    displayName:
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    name: user.firstName || '',
    email: user.email,
    role: user.personType || 'coach',
    isSuperadmin: user.isSuperadmin,
    isAdmin: user.isAdmin,
    firstName: user.firstName,
    lastName: user.lastName,
    personType: user.personType,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    active: user.active,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
    authUid: user.authUid,
  };

  return Response.json(transformedUser);
}
