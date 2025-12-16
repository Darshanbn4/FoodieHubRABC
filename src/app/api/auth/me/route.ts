import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserModel from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, UserWithoutPassword } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'No authentication token provided',
        },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Fetch user from database
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const userWithoutPassword: UserWithoutPassword = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const response: ApiResponse<{ user: UserWithoutPassword }> = {
      success: true,
      data: {
        user: userWithoutPassword,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get current user error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching user data',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
