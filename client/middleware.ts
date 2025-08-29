import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/check', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get all cookies
  const sessionCookies = request.cookies.getAll();
  
  
  console.log("Pathname:", pathname);
  console.log("Is public route:", isPublicRoute);
  console.log("All cookies:");
  sessionCookies.forEach(cookie => {
    console.log(`  ${cookie.name} = ${cookie.value}`);
  });
  
  // Check for custom authentication cookies (now HTTP-only and secure)
  const authToken = request.cookies.get('auth_token');
  const userAuthenticated = request.cookies.get('user_authenticated');
  const userId = request.cookies.get('user_id');
  
  const isAuthenticated = authToken && userAuthenticated && userAuthenticated.value === 'true' && userId;
  
  console.log("Auth token exists:", !!authToken);
  console.log("User authenticated:", userAuthenticated?.value);
  console.log("User ID exists:", !!userId);
  console.log("Is authenticated:", isAuthenticated);
  
  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is authenticated and trying to access login/signup, redirect to home
  if (isAuthenticated && isPublicRoute) {
    console.log(`Redirecting authenticated user from ${pathname} to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  console.log(`Allowing access to ${pathname}`);
  
  
  return NextResponse.next();
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
