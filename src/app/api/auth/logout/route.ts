import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST() {
  try {
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    };

    const nextResponse = NextResponse.json(response, { status: 200 });

    // Clear the token cookie
    nextResponse.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during logout',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
