import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { mpCorePerson } from '@/lib/db/schema';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    // Get all users (limit to 10 for security)
    const users = await db
      .select({
        id: mpCorePerson.id,
        email: mpCorePerson.email,
        displayName: mpCorePerson.displayName,
        firstName: mpCorePerson.firstName,
        authUid: mpCorePerson.authUid,
      })
      .from(mpCorePerson)
      .limit(10);

    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        hasAuthUid: !!user.authUid,
      })),
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
