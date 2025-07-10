'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  Person,
  mpCorePerson,
  mpCoreGroup,
  mpCorePersonGroup,
  activityLogs,
  type NewPerson,
  type NewGroup,
  type NewPersonGroup,
  type NewActivityLog,
  ActivityType,
  invitations,
  mpCoreOrganizations,
  NewOrganization,
} from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';

async function logActivity(
  organizationId: string | null | undefined,
  personId: string,
  type: ActivityType,
  ipAddress?: string,
) {
  if (organizationId === null || organizationId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    organizationId,
    personId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  // Password validation is now handled by Supabase on the client
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  // With Supabase Auth, we assume the user is already authenticated
  // on the client side. We just need to find their profile in our DB
  // and set our own application session.
  const { email } = data;

  const userWithTeam = await db
    .select({
      user: mpCorePerson,
      team: mpCoreGroup,
    })
    .from(mpCorePerson)
    .leftJoin(mpCorePersonGroup, eq(mpCorePerson.id, mpCorePersonGroup.personId))
    .leftJoin(mpCoreGroup, eq(mpCorePersonGroup.groupId, mpCoreGroup.id))
    .where(eq(mpCorePerson.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Could not find your profile. Please sign up.',
      email,
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.organizationId, foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    if (!foundTeam) {
      return {
        error: 'You are not part of any team, cannot proceed to checkout.',
      };
    }
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  authUid: z.string(), // From Supabase Auth
  inviteId: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, displayName, authUid, inviteId } = data;

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

  // A user needs a top-level organization.
  const newOrg: NewOrganization = {
    name: `${email}'s Organization`,
  };
  const [createdOrg] = await db
    .insert(mpCoreOrganizations)
    .values(newOrg)
    .returning();

  const newPerson: NewPerson = {
    email,
    displayName: displayName || email,
    authUid,
    organizationId: createdOrg.id,
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

  let groupId: string;
  let userRole: string;
  let createdGroup: typeof mpCoreGroup.$inferSelect | null = null;

  if (inviteId) {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (invitation) {
      groupId = invitation.groupId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(
        createdOrg.id,
        createdPerson.id,
        ActivityType.ACCEPT_INVITATION,
      );

      [createdGroup] = await db
        .select()
        .from(mpCoreGroup)
        .where(eq(mpCoreGroup.id, groupId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email };
    }
  } else {
    // Create a new group (team) if there's no invitation
    const newGroup: NewGroup = {
      name: `${email}'s Team`,
      organizationId: createdOrg.id,
    };

    [createdGroup] = await db.insert(mpCoreGroup).values(newGroup).returning();

    if (!createdGroup) {
      // Consider rolling back the user creation here in a real app
      return {
        error: 'Failed to create team. Please try again.',
        email,
      };
    }

    groupId = createdGroup.id;
    userRole = 'owner';

    await logActivity(
      createdOrg.id,
      createdPerson.id,
      ActivityType.CREATE_TEAM,
    );
  }

  const newPersonGroup: NewPersonGroup = {
    personId: createdPerson.id,
    groupId: groupId,
    role: userRole,
  };

  await Promise.all([
    db.insert(mpCorePersonGroup).values(newPersonGroup),
    logActivity(createdOrg.id, createdPerson.id, ActivityType.SIGN_UP),
    setSession(createdPerson),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    if (!createdGroup) {
      return {
        error: 'You are not part of any team, cannot proceed to checkout.',
      };
    }
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdGroup, priceId });
  }

  redirect('/dashboard');
});

export async function signOut() {
  const user = await getUser();
  if (!user) return;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.team?.organizationId, user.id, ActivityType.SIGN_OUT);
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

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, formData, user) => {
    // This function is deprecated and should not be used.
    // It is left here to avoid breaking the app if it's still called from somewhere.
    return {
      error: 'Password updates are handled by the authentication provider.',
    };
  },
);

const removeUserSchema = z.object({
  userId: z.string(), // Now a string (UUID)
});

export const removeUser = validatedActionWithUser(
  removeUserSchema,
  async (data, formData, user) => {
    const { userId } = data;
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.team) {
      return { error: 'Team not found.' };
    }

    const membership = await db.query.mpCorePersonGroup.findFirst({
      where: and(
        eq(mpCorePersonGroup.groupId, userWithTeam.team.id),
        eq(mpCorePersonGroup.personId, user.id),
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
          eq(mpCorePersonGroup.groupId, userWithTeam.team.id),
        ),
      );

    if (userWithTeam.team.organizationId) {
      await logActivity(
        userWithTeam.team.organizationId,
        user.id,
        ActivityType.REMOVE_TEAM_MEMBER,
      );
    }


    return { success: true, message: 'User removed.' };
  },
);

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'member']),
});

export const inviteUser = validatedActionWithUser(
  inviteUserSchema,
  async (data, formData, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);
    const team = userWithTeam?.team;
    if (!team) {
      return { error: 'Team not found.' };
    }

    const membership = await db.query.mpCorePersonGroup.findFirst({
      where: and(
        eq(mpCorePersonGroup.groupId, team.id),
        eq(mpCorePersonGroup.personId, user.id),
      ),
    });

    if (membership?.role !== 'owner') {
      return { error: 'Only owners can invite members.' };
    }

    // Check if user is already in the team
    const existingMember = await db.query.mpCorePerson.findFirst({
      where: eq(mpCorePerson.email, email),
      with: {
        groupMemberships: {
          where: eq(mpCorePersonGroup.groupId, team.id),
        },
      },
    });

    if (existingMember && existingMember.groupMemberships.length > 0) {
      return { error: 'User is already a member of this team.' };
    }

    // Check for existing pending invitation
    const existingInvitation = await db.query.invitations.findFirst({
      where: and(
        eq(invitations.groupId, team.id),
        eq(invitations.email, email),
        eq(invitations.status, 'pending'),
      ),
    });

    if (existingInvitation) {
      return { error: 'An invitation has already been sent to this email.' };
    }

    await db.insert(invitations).values({
      groupId: team.id,
      email,
      role,
      invitedBy: user.id,
    });

    if (team.organizationId) {
      await logActivity(
        team.organizationId,
        user.id,
        ActivityType.INVITE_TEAM_MEMBER,
      );
    }
    // In a real app, you would also send an email here.
    return { success: true, message: 'Invitation sent.' };
  },
);

const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Name cannot be empty.'),
});

export const updateProfile = validatedActionWithUser(
  updateProfileSchema,
  async (data, formData, user) => {
    const { displayName } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await db
      .update(mpCorePerson)
      .set({ displayName })
      .where(eq(mpCorePerson.id, user.id));

    if (userWithTeam?.team?.organizationId) {
      await logActivity(
        userWithTeam.team.organizationId,
        user.id,
        ActivityType.UPDATE_ACCOUNT,
      );
    }

    return { success: true, message: 'Profile updated successfully.' };
  },
); 