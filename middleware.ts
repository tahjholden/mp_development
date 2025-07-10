import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { refreshSession } from '@/lib/supabase/middleware';

const protectedRoutes = ['/dashboard', '/admin'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Refresh Supabase auth session if needed
  const supabaseRes = await refreshSession(request);

  // Use the response from Supabase refresh (if any) as our base response
  let res = supabaseRes ?? NextResponse.next();

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);

      if (isAdminRoute && !parsed.user.isSuperadmin) {
        // Redirect non-admins trying to access admin routes
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Refresh the session token on GET requests to keep the user logged in
      if (request.method === 'GET') {
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString(),
          }),
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          expires: expiresInOneDay,
        });
      }
    } catch (error) {
      console.error('Error updating session:', error);
      // If token verification fails, delete the cookie
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
