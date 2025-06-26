import { createClient } from './utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

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
  ]

  const isProtectedPath = (path: string) =>
    protectedPaths.some((protectedPath) => {
      if (protectedPath.includes('[id]')) {
        const regex = new RegExp(
          `^${protectedPath.replace(/\[id\]/g, '[^/]+')}`
        )
        return regex.test(path)
      }
      return path.startsWith(protectedPath)
    })

  if (!session && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
