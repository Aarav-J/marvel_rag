import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();
    
    const response = NextResponse.json({ success: true });
    
    // Production vs Development cookie settings
    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: false, // Changed to false so middleware can read them
      secure: isProduction,
      sameSite: 'lax' as const, // Changed from 'strict' for better Vercel compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };
    
    // console.log('🍪 Setting cookies with options:', {
    //   isProduction,
    //   secure: cookieOptions.secure,
    //   sameSite: cookieOptions.sameSite
    // });
    
    // Set authentication cookies
    response.cookies.set('auth_token', sessionId, cookieOptions);
    response.cookies.set('user_authenticated', 'true', cookieOptions);
    response.cookies.set('user_id', userId, cookieOptions);
    
    // Add debug headers
    response.headers.set('x-cookie-set-env', isProduction ? 'production' : 'development');
    response.headers.set('x-cookie-set-secure', cookieOptions.secure.toString());
    
    return response;
  } catch (error) {
    console.error('Error setting login cookies:', error);
    return NextResponse.json({ error: 'Failed to set cookies' }, { status: 500 });
  }
}
