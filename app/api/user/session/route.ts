import { getSession } from '@/lib/auth/session';
import { getCurrentParticipant } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Session MPBC Person ID:', session.user.mpbcPersonId);

    // Get the current participant data for display
    const participant = await getCurrentParticipant();

    console.log('Current participant data:', {
      id: participant?.id,
      firstName: participant?.firstName,
      lastName: participant?.lastName,
      personType: participant?.personType,
    });

    if (participant) {
      return NextResponse.json({
        user: {
          id: participant.id,
          name:
            [participant.firstName, participant.lastName]
              .filter(Boolean)
              .join(' ') || 'Unknown User',
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          personType: participant.personType, // This is the role/type
          organizationId: participant.organizationId,
        },
      });
    }

    // Fallback to session data if MPBC Person data not available
    return NextResponse.json({
      user: {
        id: session.user.mpbcPersonId,
        name: 'Unknown User',
        personType: 'unknown',
        organizationId: session.user.organizationId,
      },
    });
  } catch (error) {
    console.error('Error getting session data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
