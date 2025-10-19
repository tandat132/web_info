import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin authentication
    const adminToken = request.cookies.get('admin-token');
    
    // If no token and not on login page, redirect to login
    if (!adminToken && !request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // If has token and on login page, redirect to dashboard
    if (adminToken && request.nextUrl.pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};