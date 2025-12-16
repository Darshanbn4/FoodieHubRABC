import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserModel from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { ApiResponse, UserWithoutPassword } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Generate JWT token
    const userWithoutPassword: UserWithoutPassword = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = signToken(userWithoutPassword);

    // Create response with HTTP-only cookie
    const response: ApiResponse<{ user: UserWithoutPassword; token: string }> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    };

    const nextResponse = NextResponse.json(response, { status: 200 });

    // Set HTTP-only cookie
    nextResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
