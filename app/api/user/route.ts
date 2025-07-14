import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json({ user: null });
  }

  // Transform database Person to frontend User format
  const transformedUser = {
    id: user.id,
    displayName:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.email,
    name: user.firstName || '',
    email: user.email,
    role: user.role || 'User',
    isSuperadmin: user.role === 'superadmin',
    // Add any other fields that might be needed
    firstName: user.firstName,
    lastName: user.lastName,
    personType: user.personType,
    groupId: user.groupId,
    groupName: user.groupName,
    position: user.position,
  };

  return Response.json({ user: transformedUser });
}
