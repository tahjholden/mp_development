import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

type SessionData = {
  user: {
    mpbcPersonId: string; // Only MPBC Person ID for basketball app
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

export async function setMpbcSession(
  mpbcPersonId: string,
  organizationId: string
) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const token = await signToken({
    user: {
      mpbcPersonId,
      organizationId,
    },
    expires: expiresInOneDay.toISOString(),
  });

  (await cookies()).set({
    name: 'session',
    value: token,
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function clearSession() {
  (await cookies()).delete('session');
}

// Legacy function for backward compatibility - will be removed
export async function setSession() {
  console.warn('setSession is deprecated, use setMpbcSession instead');
  // This will be removed once we update all auth flows
}

// Legacy function for backward compatibility - will be removed
export async function setUnifiedSession() {
  console.warn('setUnifiedSession is deprecated, use setMpbcSession instead');
  // This will be removed once we update all auth flows
}
