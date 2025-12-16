import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import OrderModel from '@/models/Order';
import UserModel from '@/models/User';
import RestaurantModel from '@/models/Restaurant';
import { verifyToken } from '@/lib/auth';
import { getCountryFilter, hasPermission } from '@/lib/rbac';
import { ApiResponse, Order, UserWithoutPassword } from '@/types';

/**
 * GET /api/orders
 * Fetch orders for the authenticated user with country-based filtering
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

    // Apply country-based filtering
    const countryFilter = getCountryFilter(userWithoutPassword);
    
    // Fetch orders with country filter
    const orders = await OrderModel.find({
      userId: userWithoutPassword._id,
      ...countryFilter,
    }).sort({ createdAt: -1 });

    const response: ApiResponse<{ orders: Order[] }> = {
      success: true,
      data: {
        orders: orders.map((order) => ({
          _id: order._id.toString(),
          userId: order.userId,
          restaurantId: order.restaurantId,
          items: order.items,
          status: order.status,
          total: order.total,
          country: order.country,
          currencySymbol: order.currencySymbol || '$',
          paymentMethodId: order.paymentMethodId,
          cancelledAt: order.cancelledAt,
          cancelReason: order.cancelReason,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get orders error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching orders',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Create a new order (place order from cart)
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

    // Check if user has permission to place orders
    if (!hasPermission(userWithoutPassword.role, 'place_order')) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'You do not have permission to place orders',
        },
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { restaurantId, items, paymentMethodId } = body;

    // Validate input
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Restaurant ID and items are required',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Fetch restaurant to get currency symbol
    const restaurant = await RestaurantModel.findById(restaurantId);
    const currencySymbol = restaurant?.currencySymbol || '$';

    // Create order
    const order = await OrderModel.create({
      userId: userWithoutPassword._id,
      restaurantId,
      items,
      status: 'placed',
      total,
      country: userWithoutPassword.country,
      currencySymbol,
      paymentMethodId,
    });

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
          currencySymbol: order.currencySymbol,
          paymentMethodId: order.paymentMethodId,
          cancelledAt: order.cancelledAt,
          cancelReason: order.cancelReason,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while creating the order',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
