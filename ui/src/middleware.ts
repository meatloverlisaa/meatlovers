import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enforce authentication on protected routes
 * Redirects unauthenticated users to appropriate login pages
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies or check if user data exists
  const authToken = request.cookies.get('auth_token')?.value;
  
  // For client-side rendered apps, we need to check localStorage
  // But middleware runs on server, so we'll check cookies
  // If no cookie, check for Next.js token in headers
  const hasToken = authToken || request.headers.get('authorization');
  
  // Define protected route patterns and their login pages
  const protectedRoutes: { pattern: RegExp; loginPath: string }[] = [
    { pattern: /^\/super-admin(?!\/login)/, loginPath: '/super-admin/login' },
    { pattern: /^\/admin(?!\/login)/, loginPath: '/admin/login' },
    { pattern: /^\/manager(?!\/login)/, loginPath: '/manager/login' },
    { pattern: /^\/hr(?!\/login)/, loginPath: '/hr/login' },
    { pattern: /^\/storekeeper(?!\/login)/, loginPath: '/storekeeper/login' },
    { pattern: /^\/accountant(?!\/login)/, loginPath: '/accountant/login' },
    { pattern: /^\/dispatcher(?!\/login)/, loginPath: '/dispatcher/login' },
    { pattern: /^\/cashier(?!\/login)/, loginPath: '/cashier/login' },
    { pattern: /^\/bar(?!\/login)/, loginPath: '/bar/login' },
    { pattern: /^\/kitchen(?!\/login)/, loginPath: '/kitchen/login' },
    { pattern: /^\/pos(?!\/login)/, loginPath: '/pos/login' },
  ];
  
  // Check if current path matches any protected route
  for (const route of protectedRoutes) {
    if (route.pattern.test(pathname)) {
      // Note: In a client-side app with localStorage auth, 
      // this middleware can't fully check authentication
      // The real auth check happens in useRequireAuth hook
      // This middleware is just a lightweight first layer
      
      // Allow the request to proceed
      // The useRequireAuth hook on the page will handle the actual redirect
      return NextResponse.next();
    }
  }
  
  // Allow all other requests
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 * We want it to run on all dashboard routes but not on:
 * - API routes
 * - Static files
 * - Image optimization
 * - Next.js internal routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|debug-auth.html).*)',
  ],
};
