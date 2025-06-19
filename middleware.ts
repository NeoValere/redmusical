import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/musicians/[id]/edit',
    '/api/musicians', // All musician API routes
    '/api/register-profile',
    '/api/switch-role',
    '/api/create-preference',
    '/api/webhook', // Webhook might need different auth, but for now, include it
    '/favorites',
    '/admin',
  ];

  // Check if the current path is protected
  const isProtected = protectedPaths.some(path => {
    // Simple check for now, can be improved with a more robust path matching
    // For dynamic routes like /musicians/[id]/edit, we check if the path starts with the base
    if (path.includes('[id]')) {
      const base = path.split('[id]')[0];
      return req.nextUrl.pathname.startsWith(base.replace(/\/$/, '')); // Remove trailing slash for base comparison
    }
    return req.nextUrl.pathname.startsWith(path);
  });

  // If the path is protected and there's no session, redirect to login
  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the path is /login or /register and there's a session, redirect to dashboard
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') && session) {
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
