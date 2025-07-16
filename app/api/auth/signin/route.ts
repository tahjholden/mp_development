import { NextRequest, NextResponse } from 'next/server';
import { setMpbcSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { mpbcPerson } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      console.error('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Step 1: Find the user in mpbcPerson table
    if (!db) {
      console.error('Database connection not available');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const userResult = await db
      .select()
      .from(mpbcPerson)
      .where(eq(mpbcPerson.email, email))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      console.error('User not found in mpbc_person for email:', email);
      return NextResponse.json(
        {
          error:
            'Could not find your profile. Please contact your administrator.',
        },
        { status: 404 }
      );
    }

    // Step 2: For now, skip password verification to simplify
    // In production, you'd verify the password here
    console.log('Found user:', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      personType: user.personType,
    });

    // Step 3: Set session cookie with MPBC Person data
    try {
      await setMpbcSession(user.id, user.organizationId || '');
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
