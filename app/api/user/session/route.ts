import { getSession } from '@/lib/auth/session';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Session MPBC Person ID:', session.user.mpbcPersonId);

    // Query mpbc_person directly using the mpbcPersonId from session
    if (db) {
      try {
        const personResult = await db
          .select({
            id: mpbcPerson.id,
            firstName: mpbcPerson.firstName,
            lastName: mpbcPerson.lastName,
            email: mpbcPerson.email,
            personType: mpbcPerson.personType,
            organizationId: mpbcPerson.organizationId,
          })
          .from(mpbcPerson)
          .where(eq(mpbcPerson.id, session.user.mpbcPersonId))
          .limit(1);

        if (personResult.length > 0 && personResult[0]) {
          const person = personResult[0];
          console.log('mpbc_person query result:', {
            id: person.id,
            firstName: person.firstName,
            lastName: person.lastName,
            personType: person.personType,
          });

          return NextResponse.json({
            user: {
              id: person.id,
              name:
                [person.firstName, person.lastName].filter(Boolean).join(' ') ||
                'Unknown User',
              firstName: person.firstName,
              lastName: person.lastName,
              email: person.email,
              personType: person.personType,
              organizationId: person.organizationId,
            },
          });
        }
      } catch (error) {
        console.error('Error querying mpbc_person:', error);
      }
    }

    // Final fallback to session data if no person data available
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
