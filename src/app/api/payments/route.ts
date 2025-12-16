import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PaymentMethodModel from '@/models/PaymentMethod';
import UserModel from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { ApiResponse, PaymentMethod, UserWithoutPassword } from '@/types';

/**
 * GET /api/payments
 * Fetch all payment methods (Admin only)
 */
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

    // Check if user has permission to manage payments
    if (!hasPermission(userWithoutPassword.role, 'manage_payments')) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'You do not have permission to view payment methods',
        },
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Fetch all payment methods
    const paymentMethods = await PaymentMethodModel.find().sort({ createdAt: -1 });

    const response: ApiResponse<{ paymentMethods: PaymentMethod[] }> = {
      success: true,
      data: {
        paymentMethods: paymentMethods.map((pm) => ({
          _id: pm._id.toString(),
          name: pm.name,
          type: pm.type,
          lastFourDigits: pm.lastFourDigits,
          isDefault: pm.isDefault,
          createdAt: pm.createdAt,
          updatedAt: pm.updatedAt,
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get payment methods error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching payment methods',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/payments
 * Create a new payment method (Admin only)
 */
export async function POST(request: NextRequest) {
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

    // Check if user has permission to manage payments
    if (!hasPermission(userWithoutPassword.role, 'manage_payments')) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'You do not have permission to create payment methods',
        },
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, type, lastFourDigits, isDefault } = body;

    // Validate input
    if (!name || !type || !lastFourDigits) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, type, and last four digits are required',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate type
    if (!['credit_card', 'debit_card', 'upi'].includes(type)) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payment method type',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate lastFourDigits format
    if (!/^\d{4}$/.test(lastFourDigits)) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Last four digits must be exactly 4 digits',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await PaymentMethodModel.updateMany({}, { isDefault: false });
    }

    // Create payment method
    const paymentMethod = await PaymentMethodModel.create({
      name,
      type,
      lastFourDigits,
      isDefault: isDefault || false,
    });

    const response: ApiResponse<{ paymentMethod: PaymentMethod }> = {
      success: true,
      data: {
        paymentMethod: {
          _id: paymentMethod._id.toString(),
          name: paymentMethod.name,
          type: paymentMethod.type,
          lastFourDigits: paymentMethod.lastFourDigits,
          isDefault: paymentMethod.isDefault,
          createdAt: paymentMethod.createdAt,
          updatedAt: paymentMethod.updatedAt,
        },
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create payment method error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while creating the payment method',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
