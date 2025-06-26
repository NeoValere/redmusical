import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
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

  return response;
}
