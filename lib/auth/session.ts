import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { mpCorePerson } from '@/lib/db/schema';
import { UnifiedUser } from '@/lib/db/user-service';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

type SessionData = {
  user: {
    id: string;
    isSuperadmin: boolean;
    isAdmin: boolean;
    primaryRole: string;
    organizationId: string;
  };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

// Legacy function for backward compatibility
export async function setSession(user: typeof mpCorePerson.$inferSelect) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: {
      id: user.id,
      isSuperadmin: false, // Default to false for legacy compatibility
      isAdmin: false,
      primaryRole: 'player',
      organizationId: user.organizationId || '',
    },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

// New function for unified user data with proper role information
export async function setUnifiedSession(user: UnifiedUser) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: {
      id: user.id,
      isSuperadmin: user.isSuperadmin,
      isAdmin: user.isAdmin,
      primaryRole: user.primaryRole,
      organizationId: user.organizationId,
    },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
