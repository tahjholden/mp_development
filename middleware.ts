import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { getCurrentUser } from '@/lib/db/user-service';

const protectedRoutes = ['/dashboard', '/admin'];
const adminRoutes = ['/admin'];
const superadminRoutes = ['/admin/superadmin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isSuperadminRoute = superadminRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);

      // Get current user data for role checking
      const currentUser = await getCurrentUser();

      if (currentUser) {
        const userRole = currentUser.personType || 'coach';
        const isSuperadmin = userRole === 'superadmin';
        const isAdmin = userRole === 'admin' || isSuperadmin;

        // Enforce role-based access control
        if (isSuperadminRoute && !isSuperadmin) {
          // Redirect non-superadmins trying to access superadmin routes
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (isAdminRoute && !isAdmin) {
          // Redirect non-admins trying to access admin routes
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Role-based dashboard routing
        if (pathname === '/dashboard') {
          // Redirect users to role-specific dashboards if they exist
          if (userRole === 'player') {
            // Players might have a different dashboard
            // For now, keep them on the main dashboard
          } else if (userRole === 'superadmin') {
            // Superadmins can access everything, stay on main dashboard
          } else if (userRole === 'admin') {
            // Admins can access everything, stay on main dashboard
          } else {
            // Coaches and other roles stay on main dashboard
          }
        }
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
