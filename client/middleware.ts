import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/check', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check for custom authentication cookies
  const authToken = request.cookies.get('auth_token');
  const userAuthenticated = request.cookies.get('user_authenticated');
  const userId = request.cookies.get('user_id');
  
  const isAuthenticated = authToken && userAuthenticated && userAuthenticated.value === 'true' && userId;
  
  // Create response
  const response = NextResponse.next();
  
  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is authenticated and trying to access login/signup, redirect to home
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return response;
}

// Minimal matcher configuration
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.ico|.*\\..*$).*)',
  ],
};
