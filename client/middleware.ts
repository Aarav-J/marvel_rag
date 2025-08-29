import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add environment debugging
  const isProduction = process.env.NODE_ENV === 'production';
  const host = request.headers.get('host');
  const origin = request.headers.get('origin');
  
  console.log("🌍 Environment:", process.env.NODE_ENV);
  console.log("🌐 Host:", host);
  console.log("🔗 Origin:", origin);
  console.log("📍 Full URL:", request.url);
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/check', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get all cookies
  const sessionCookies = request.cookies.getAll();
  
  console.log("📍 Pathname:", pathname);
  console.log("🔓 Is public route:", isPublicRoute);
  console.log("🍪 All cookies found:", sessionCookies.length);
  
  if (sessionCookies.length > 0) {
    console.log("🍪 Cookie details:");
    sessionCookies.forEach(cookie => {
      console.log(`  ${cookie.name} = ${cookie.value}`);
    });
  } else {
    console.log("🚫 No cookies found!");
  }
  
  // Check for custom authentication cookies
  const authToken = request.cookies.get('auth_token');
  const userAuthenticated = request.cookies.get('user_authenticated');
  const userId = request.cookies.get('user_id');
  
  const isAuthenticated = authToken && userAuthenticated && userAuthenticated.value === 'true' && userId;
  
  console.log("🔑 Auth token exists:", !!authToken);
  console.log("✅ User authenticated:", userAuthenticated?.value);
  console.log("👤 User ID exists:", !!userId);
  console.log("🎯 Is authenticated:", !!isAuthenticated);
  
  // Create response with debug headers for production debugging
  const response = NextResponse.next();
  
  // Add debug headers visible in Network tab
  response.headers.set('x-middleware-env', process.env.NODE_ENV || 'unknown');
  response.headers.set('x-middleware-host', host || 'unknown');
  response.headers.set('x-middleware-cookies-count', sessionCookies.length.toString());
  response.headers.set('x-middleware-authenticated', (!!isAuthenticated).toString());
  response.headers.set('x-middleware-pathname', pathname);
  
  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    console.log(`🚫 Redirecting unauthenticated user from ${pathname} to /login`);
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    redirectResponse.headers.set('x-middleware-action', 'redirect-to-login');
    return redirectResponse;
  }
  
  // If user is authenticated and trying to access login/signup, redirect to home
  if (isAuthenticated && isPublicRoute) {
    console.log(`🏠 Redirecting authenticated user from ${pathname} to /`);
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    redirectResponse.headers.set('x-middleware-action', 'redirect-to-home');
    return redirectResponse;
  }
  
  console.log(`✅ Allowing access to ${pathname}`);
  response.headers.set('x-middleware-action', 'allow');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.ico (favicon files)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.ico|.*\\..*$).*)',
  ],
};
