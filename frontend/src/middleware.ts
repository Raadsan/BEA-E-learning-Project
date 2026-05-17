import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if accessing portal routes
  if (pathname.startsWith('/portal/')) {
    // Get token from cookies (if using cookies) or check in client-side
    // Since we're using localStorage, we'll handle this in ProtectedRoute
    // But we can add a server-side check here if needed
    
    // Handle plural/singular route mismatch
    if (pathname === '/portal/students') {
      return NextResponse.redirect(new URL('/portal/student', request.url));
    }
    
    if (pathname === '/portal/teachers') {
      return NextResponse.redirect(new URL('/portal/teacher', request.url));
    }
    
    if (pathname === '/portal/admins') {
      return NextResponse.redirect(new URL('/portal/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/portal/:path*',
  ],
};

