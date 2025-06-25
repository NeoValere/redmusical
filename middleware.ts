import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Define paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/m/[id]/edit',
    '/m/[id]/upload-image',
    '/api/m/[id]/update',
    '/api/m/[id]/update-profile',
    '/api/m/[id]/upload-image',
    '/api/switch-role',
    '/api/create-preference',
    '/api/webhook',
    '/favorites',
    // Note: /api/user/profile-details is implicitly protected
    // because it requires a valid session, but it doesn't need to be listed here.
    // The middleware ensures the session is fresh for all requests.
  ];

  // Function to check if a path is protected
  const isProtectedPath = (path: string) => {
    return protectedPaths.some(protectedPath => {
      if (protectedPath.includes('[id]')) {
        // Convert dynamic route pattern to a regex
        const regex = new RegExp(`^${protectedPath.replace(/\[id\]/g, '[^/]+')}`);
        return regex.test(path);
      }
      return path.startsWith(protectedPath);
    });
  };

  // If the user is not authenticated and is trying to access a protected path
  if (!session && isProtectedPath(pathname)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is authenticated and tries to access login or register, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (e.g. /images)
     * - Any other static assets or public routes that don't need authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
