import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin authentication
    const adminToken = request.cookies.get('admin-token');
    const isLoginPage = request.nextUrl.pathname === '/admin/login';
    const isApiRoute = request.nextUrl.pathname.startsWith('/admin/api') || request.nextUrl.pathname.startsWith('/api/admin');
    
    // Skip middleware for API routes (let them handle their own auth)
    if (isApiRoute) {
      return NextResponse.next();
    }
    
    // If no token and not on login page, redirect to login
    if (!adminToken && !isLoginPage) {
      console.log('No admin token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // If has token and on login page, redirect to dashboard
    if (adminToken && adminToken.value === 'authenticated' && isLoginPage) {
      console.log('Admin token found on login page, redirecting to dashboard');
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