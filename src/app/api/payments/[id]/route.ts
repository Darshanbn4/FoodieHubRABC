import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PaymentMethodModel from '@/models/PaymentMethod';
import UserModel from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { ApiResponse, PaymentMethod, UserWithoutPassword } from '@/types';

/**
 * PUT /api/payments/[id]
 * Update a payment method (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
          message: 'You do not have permission to update payment methods',
        },
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, type, lastFourDigits, isDefault } = body;

    // Find payment method
    const paymentMethod = await PaymentMethodModel.findById(params.id);
    if (!paymentMethod) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Payment method not found',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Validate type if provided
    if (type && !['credit_card', 'debit_card', 'upi'].includes(type)) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payment method type',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate lastFourDigits format if provided
    if (lastFourDigits && !/^\d{4}$/.test(lastFourDigits)) {
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
    if (isDefault && !paymentMethod.isDefault) {
      await PaymentMethodModel.updateMany(
        { _id: { $ne: params.id } },
        { isDefault: false }
      );
    }

    // Update payment method
    if (name !== undefined) paymentMethod.name = name;
    if (type !== undefined) paymentMethod.type = type;
    if (lastFourDigits !== undefined) paymentMethod.lastFourDigits = lastFourDigits;
    if (isDefault !== undefined) paymentMethod.isDefault = isDefault;

    await paymentMethod.save();

    const response: ApiResponse<{ paymentMethod: PaymentMethod }> = {
      success: true,
      data: {
        paymentMethod: {
          _id: paymentMethod._id.toString(),
          name: paymentMethod.name,
          type: paymentMethod.type,
          lastFourDigits: paymentMethod.lastFourDigits,
          isDefault: paymentMethod.isDefault,
          isActive: paymentMethod.isActive,
          createdAt: paymentMethod.createdAt,
          updatedAt: paymentMethod.updatedAt,
        },
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Update payment method error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating the payment method',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/payments/[id]
 * Delete a payment method (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
          message: 'You do not have permission to delete payment methods',
        },
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Find and delete payment method
    const paymentMethod = await PaymentMethodModel.findByIdAndDelete(params.id);
    if (!paymentMethod) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Payment method not found',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Payment method deleted successfully',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Delete payment method error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting the payment method',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
