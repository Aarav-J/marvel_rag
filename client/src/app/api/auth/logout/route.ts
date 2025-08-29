import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Production vs Development cookie settings
    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: false, // Match the login route
      secure: isProduction,
      sameSite: 'lax' as const,
      expires: new Date(0), // Expire immediately
      path: '/',
    };
    
    console.log('🗑️ Clearing cookies with options:', {
      isProduction,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite
    });
    
    // Clear authentication cookies by setting them to expire
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('user_authenticated', '', cookieOptions);
    response.cookies.set('user_id', '', cookieOptions);
    
    // Add debug headers
    response.headers.set('x-cookie-clear-env', isProduction ? 'production' : 'development');
    
    return response;
  } catch (error) {
    console.error('Error clearing logout cookies:', error);
    return NextResponse.json({ error: 'Failed to clear cookies' }, { status: 500 });
  }
}
