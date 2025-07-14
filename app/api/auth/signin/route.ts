import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';

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

    const supabase = createClient();

    // Step 1: Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Auth error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      console.error('Supabase Auth: No user returned');
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Step 2: Find the user in our database
    if (!db) {
      console.error('Database connection not available');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    // Try to find by auth_uid first, fallback to email for legacy
    let userResult = await db
      .select()
      .from(mpCorePerson)
      .where(eq(mpCorePerson.authUid, data.user.id))
      .limit(1);

    let user = userResult[0];

    if (!user) {
      // Fallback: try by email (legacy)
      userResult = await db
        .select()
        .from(mpCorePerson)
        .where(eq(mpCorePerson.email, email))
        .limit(1);
      user = userResult[0];
    }

    if (!user) {
      console.error(
        'User not found in mp_core_person for email:',
        email,
        'and auth_uid:',
        data.user.id
      );
      return NextResponse.json(
        {
          error:
            'Could not find your profile. Please contact your administrator.',
        },
        { status: 404 }
      );
    }

    // Step 3: Set session cookie
    try {
      await setSession(user);
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
