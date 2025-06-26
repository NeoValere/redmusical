import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ipAddress, geolocation } from '@vercel/functions';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
      cookieEncoding: 'raw',
    },
  );

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

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
  ];

  const isProtectedPath = (path: string) =>
    protectedPaths.some((protectedPath) => {
      if (protectedPath.includes('[id]')) {
        const regex = new RegExp(`^${protectedPath.replace(/\[id\]/g, '[^/]+')}`);
        return regex.test(path);
      }
      return path.startsWith(protectedPath);
    });

  if (!session && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const ip = ipAddress(request);
  const { city, country, latitude, longitude, region } = geolocation(request);

  response.headers.set('x-ip-address', ip || 'unknown');
  response.headers.set('x-city', city || 'unknown');
  response.headers.set('x-country', country || 'unknown');
  response.headers.set('x-latitude', latitude || 'unknown');
  response.headers.set('x-longitude', longitude || 'unknown');
  response.headers.set('x-region', region || 'unknown');

  return response;
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
