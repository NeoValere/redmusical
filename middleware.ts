import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Removed prisma import: import prisma from '@/lib/prisma';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Handle /admin routes specifically
  // if (pathname.startsWith('/admin')) {
  //   if (!session) {
  //     // Not logged in, redirect to login
  //     const redirectUrl = req.nextUrl.clone();
  //     redirectUrl.pathname = '/login';
  //     redirectUrl.searchParams.set(`redirectedFrom`, pathname);
  //     return NextResponse.redirect(redirectUrl);
  //   }

  //   // Logged in, call the API route to check if user is an admin
  //   try {
  //     // Construct the absolute URL for the API route
  //     const checkAdminUrl = new URL('/api/auth/check-admin-status', req.url);
      
  //     // Pass along the cookies from the original request to the API route
  //     // This is crucial for the API route to authenticate the user with Supabase
  //     const apiRes = await fetch(checkAdminUrl.toString(), {
  //       headers: {
  //         cookie: req.headers.get('cookie') || '', // Pass existing cookies
  //       },
  //     });

  //     if (!apiRes.ok) {
  //       console.error("Admin check API call failed:", apiRes.status, await apiRes.text());
  //       // Not an admin or error, redirect to homepage
  //       return NextResponse.redirect(new URL('/', req.url));
  //     }

  //     const { isAdmin, error: apiError } = await apiRes.json();

  //     if (apiError) {
  //       console.error("Error from admin check API:", apiError);
  //       return NextResponse.redirect(new URL('/', req.url));
  //     }

  //     if (!isAdmin) {
  //       // Not an admin, redirect to homepage
  //       return NextResponse.redirect(new URL('/', req.url));
  //     }
  //     // User is an admin, allow access
  //     return res;
  //   } catch (error) {
  //     console.error("Error calling admin check API in middleware:", error);
  //     // On error, redirect to a generic error page or homepage
  //     return NextResponse.redirect(new URL('/error', req.url));
  //   }
  // }

  // Define paths that require authentication (excluding /admin as it's handled above)
  const protectedPaths = [
    '/dashboard',
    '/m/[id]/edit',
    '/m/[id]/upload-image', // Add upload-image page to protected paths
    '/api/m/[id]/update', // Specific API routes that need protection
    '/api/m/[id]/update-profile',
    '/api/m/[id]/upload-image',
    '/api/switch-role',
    '/api/create-preference',
    '/api/webhook',
    '/favorites',
  ];

  // Special handling for public musician profiles: they should not be protected
  // This checks if the path starts with /m/ and does NOT contain /edit or /upload-image
  const isPublicMusicianProfilePage = pathname.startsWith('/m/') &&
                                 !pathname.includes('/edit') &&
                                 !pathname.includes('/upload-image');

  // Allow public access to the get-profile API endpoint
  const isPublicGetProfileAPI = pathname.match(/^\/api\/m\/[^/]+\/get-profile$/);

  if (isPublicMusicianProfilePage || isPublicGetProfileAPI) {
    return res; // Allow access without authentication
  }

  // Check if the current path is protected
  const isProtected = protectedPaths.some(path => {
    // For dynamic routes like /m/[id]/edit, we check if the path starts with the base
    // and is not the specific get-profile route (already handled)
    if (path.includes('[id]')) {
      const base = path.split('[id]')[0];
      // Ensure we are not re-protecting the get-profile API if it matches a broader pattern
      if (pathname.startsWith(base.replace(/\/$/, '')) && !isPublicGetProfileAPI) {
        return true;
      }
      return false;
    }
    return pathname.startsWith(path);
  });

  // If the path is protected and there's no session, redirect to login
  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set(`redirectedFrom`, pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the path is /login or /register and there's a session, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && session) {
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
