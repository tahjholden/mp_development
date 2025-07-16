'use server';

import { z } from 'zod';
import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  mpCorePerson,
  mpCorePersonGroup,
  infrastructureInvitations,
  infrastructureActivityLogs,
} from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
// import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

// Define ActivityType enum since it's not in the schema
export enum ActivityType {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

// Define types for the activity log
type NewActivityLog = {
  organizationId: string | null;
  personId: string;
  action: ActivityType;
  ipAddress: string;
};

type NewPerson = {
  email: string;
  firstName: string;
  displayName: string;
  authUid: string;
  organizationId: string | null;
};

async function logActivity(
  organizationId: string | null | undefined,
  personId: string,
  type: ActivityType,
  ipAddress?: string
) {
  if (organizationId === null || organizationId === undefined || !db) {
    return;
  }
  const newActivity: NewActivityLog = {
    organizationId,
    personId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await db.insert(infrastructureActivityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  // Password validation is now handled by Supabase on the client
});

export async function signIn(prevState: any, formData: FormData) {
  'use server';
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0]?.message || 'Validation failed' };
  }
  const { email } = result.data;

  if (!db) {
    return {
      error: 'Database connection not available.',
      email,
    };
  }

  const userWithTeam = await db
    .select({
      user: mpCorePerson,
    })
    .from(mpCorePerson)
    .where(eq(mpCorePerson.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Could not find your profile. Please sign up.',
      email,
    };
  }

  const foundUser = userWithTeam[0]?.user;
  if (!foundUser) {
    return {
      error: 'Could not find your profile. Please sign up.',
      email,
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundUser.organizationId, foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    // const priceId = formData.get('priceId') as string;
    // return createCheckoutSession({ user: foundUser, priceId });
    redirect('/dashboard');
  }

  redirect('/dashboard');
}

const signUpSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  authUid: z.string(), // Supabase Auth UID
  inviteId: z.string().optional(),
});

export async function signUp(prevState: any, formData: FormData) {
  'use server';
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0]?.message || 'Validation failed' };
  }
  const { email, displayName, authUid } = result.data;

  if (!db) {
    return {
      error: 'Database connection not available.',
      email,
    };
  }

  const existingUser = await db
    .select()
    .from(mpCorePerson)
    .where(eq(mpCorePerson.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    // This case might happen in race conditions or if user signs up
    // with provider (e.g., Google) and then with email/pass.
    // For now, we'll treat it as an error to keep it simple.
    return {
      error: 'A user with this email already exists.',
      email,
    };
  }

  const newPerson: NewPerson = {
    email,
    firstName: displayName || email,
    displayName: displayName || email,
    authUid,
    organizationId: null, // We'll handle this later if needed
  };

  const [createdPerson] = await db
    .insert(mpCorePerson)
    .values(newPerson)
    .returning();

  if (!createdPerson) {
    return {
      error: 'Failed to create your profile. Please try again.',
      email,
    };
  }

  // Simplified signup - just create the person
  await Promise.all([
    logActivity(
      createdPerson.organizationId,
      createdPerson.id,
      ActivityType.SIGN_UP
    ),
    setSession(createdPerson),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    // const priceId = formData.get('priceId') as string;
    // return createCheckoutSession({ user: createdPerson, priceId });
    redirect('/dashboard');
  }

  redirect('/dashboard');
}

export async function signOut() {
  'use server';
  const user = await getUser();
  if (!user) return;
  await logActivity(user.organizationId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
  redirect('/sign-in');
}

const updatePasswordSchema = z.object({
  // This entire action is now deprecated, as password management is
  // handled by Supabase Auth. It should be removed from the UI.
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

export async function updatePassword(prevState: any, formData: FormData) {
  'use server';
  const user = await getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0]?.message || 'Validation failed' };
  }

  // This function is deprecated and should not be used.
  // It is left here to avoid breaking the app if it's still called from somewhere.
  return {
    error: 'Password updates are handled by the authentication provider.',
  };
}

const removeUserSchema = z.object({
  userId: z.string(), // Now a string (UUID)
});

export async function removeUser(prevState: any, formData: FormData) {
  'use server';
  const user = await getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const result = removeUserSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0]?.message || 'Validation failed' };
  }
  const { userId } = result.data;

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.team) {
    return { error: 'Team not found.' };
  }

  if (!db) {
    return { error: 'Database connection not available.' };
  }

  const membership = await db.query.mpCorePersonGroup.findFirst({
    where: and(
      isNotNull(mpCorePersonGroup.groupId),
      eq(mpCorePersonGroup.groupId, userWithTeam.team.id),
      eq(mpCorePersonGroup.personId, user.id)
    ),
  });

  if (membership?.role !== 'owner') {
    return { error: 'Only owners can remove members.' };
  }

  await db
    .delete(mpCorePersonGroup)
    .where(
      and(
        eq(mpCorePersonGroup.personId, userId),
        eq(mpCorePersonGroup.groupId, userWithTeam.team.id)
      )
    );

  // Note: team.organizationId doesn't exist in the current schema
  // We'll use the user's organizationId instead
  if (user.organizationId) {
    await logActivity(
      user.organizationId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );
  }

  return { success: true, message: 'User removed.' };
}

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'member']),
});

export async function inviteUser(prevState: any, formData: FormData) {
  'use server';
  const user = await getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const result = inviteUserSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0]?.message || 'Validation failed' };
  }
  const { email, role } = result.data;

  const userWithTeam = await getUserWithTeam(user.id);
  const team = userWithTeam?.team;
  if (!team) {
    return { error: 'Team not found.' };
  }

  if (!db) {
    return { error: 'Database connection not available.' };
  }

  if (!team.id || !user.id) {
    return { error: 'Invalid team or user ID.' };
  }
  // Check for existing pending invitation
  const existingInvitation =
    await db.query.infrastructureInvitations.findFirst({
      where: and(
        eq(infrastructureInvitations.teamId, team.id),
        eq(infrastructureInvitations.email, email),
        eq(infrastructureInvitations.status, 'pending')
      ),
    });

  if (existingInvitation) {
    return { error: 'An invitation has already been sent to this email.' };
  }

  await db.insert(infrastructureInvitations).values({
    teamId: team.id,
    email,
    role,
    invitedBy: user.id,
  });

  // Note: team.organizationId doesn't exist in the current schema
  // We'll use the user's organizationId instead
  if (user.organizationId) {
    await logActivity(
      user.organizationId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );
  }
  // In a real app, you would also send an email here.
  return { success: true, message: 'Invitation sent.' };
}

const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Name cannot be empty.'),
});

export async function updateProfile(prevState: any, formData: FormData) {
  'use server';
  const user = await getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const result = updateProfileSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0]?.message || 'Validation failed' };
  }
  const { displayName } = result.data;

  const userWithTeam = await getUserWithTeam(user.id);

  if (!db) {
    return { error: 'Database connection not available.' };
  }

  await db
    .update(mpCorePerson)
    .set({ displayName })
    .where(eq(mpCorePerson.id, user.id));

  // Note: team.organizationId doesn't exist in the current schema
  // We'll use the user's organizationId instead
  if (user.organizationId) {
    await logActivity(
      user.organizationId,
      user.id,
      ActivityType.UPDATE_ACCOUNT
    );
  }

  return { success: true, message: 'Profile updated successfully.' };
}
