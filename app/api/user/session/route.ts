import { getSession } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        isSuperadmin: session.user.isSuperadmin,
        isAdmin: session.user.isAdmin,
        primaryRole: session.user.primaryRole,
        organizationId: session.user.organizationId,
      },
    });
  } catch (error) {
    console.error('Error getting session data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 