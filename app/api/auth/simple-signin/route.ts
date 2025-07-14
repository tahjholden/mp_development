import { NextRequest, NextResponse } from 'next/server';
import { setSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { displayName } = await request.json();

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Find the user in our database by display name
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const userResult = await db
      .select()
      .from(mpCorePerson)
      .where(eq(mpCorePerson.displayName, displayName))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create our custom session
    await setSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    console.error('Simple sign-in error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
