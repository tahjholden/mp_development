import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, displayName } =
      await request.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Email, password, and display name are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // First create the user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          firstName,
          lastName,
          displayName,
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user in authentication system' },
        { status: 500 }
      );
    }

    // Then create the user in our database
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const userResult = await db
      .insert(mpCorePerson)
      .values({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        displayName,
        personType: 'player', // Default to player
        authUid: authData.user.id, // Link to Supabase Auth user
        active: true,
      })
      .returning();

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user in database' },
        { status: 500 }
      );
    }

    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user in database' },
        { status: 500 }
      );
    }

    // Create our custom session
    await setSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
