import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import OrderModel from '@/models/Order';
import UserModel from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { canCancelOrder } from '@/lib/rbac';
import { ApiResponse, Order, UserWithoutPassword } from '@/types';

/**
 * POST /api/orders/[id]/cancel
 * Cancel an existing order
 */
export async function POST(
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

    // Fetch the order
    const order = await OrderModel.findById(params.id);
    if (!order) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if user can cancel this order (permission + country scope)
    if (!canCancelOrder(userWithoutPassword, order.country)) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'You do not have permission to cancel this order',
        },
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Check if order can be cancelled (must be in 'placed' status)
    if (order.status !== 'placed') {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'ORDER_CANNOT_CANCEL',
          message: `Order cannot be cancelled. Current status: ${order.status}`,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Parse request body for cancel reason
    const body = await request.json();
    const { reason } = body;

    // Update order status to cancelled
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'No reason provided';
    await order.save();

    const response: ApiResponse<{ order: Order }> = {
      success: true,
      data: {
        order: {
          _id: order._id.toString(),
          userId: order.userId,
          restaurantId: order.restaurantId,
          items: order.items,
          status: order.status,
          total: order.total,
          country: order.country,
          paymentMethodId: order.paymentMethodId,
          cancelledAt: order.cancelledAt,
          cancelReason: order.cancelReason,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Cancel order error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while cancelling the order',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
