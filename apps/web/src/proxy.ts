import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): { sub: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!));
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes, always accessible
  if (pathname.startsWith('/public') || pathname === '/') {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;

  // No token, redirect to login
  if (!token) {
    const loginUrl = new URL('/public/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload (lightweight check, full validation happens API-side)
  const payload = decodeJwtPayload(token);
  if (!payload) {
    const loginUrl = new URL('/public/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = payload.role;

  // Admin routes, require ADMIN role
  if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
    const agentUrl = new URL('/dashboard/agent', request.url);
    return NextResponse.redirect(agentUrl);
  }

  // Agent routes, require AGENT role
  if (pathname.startsWith('/dashboard/agent') && role !== 'AGENT') {
    const adminUrl = new URL('/dashboard/admin/analytics', request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next internal routes (including dev HMR endpoints)
     * - favicon
     */
    '/((?!api|_next|favicon.ico).*)',
  ],
};
