import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RestaurantModel from '@/models/Restaurant';
import UserModel from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { getCountryFilter } from '@/lib/rbac';
import { ApiResponse, Restaurant, UserWithoutPassword } from '@/types';

/**
 * GET /api/restaurants
 * Fetch restaurants filtered by user's country (Admin sees all)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('token')?.value;

    let countryFilter = {};

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const user = await UserModel.findById(payload.userId);
        if (user) {
          const userWithoutPassword: UserWithoutPassword = {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            country: user.country,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
          // Apply country filter based on user role
          countryFilter = getCountryFilter(userWithoutPassword);
        }
      }
    }

    // Fetch restaurants with country filter
    const restaurants = await RestaurantModel.find({
      isActive: true,
      ...countryFilter,
    }).sort({ rating: -1, name: 1 });

    const response: ApiResponse<{ restaurants: Restaurant[] }> = {
      success: true,
      data: {
        restaurants: restaurants.map((restaurant) => ({
          _id: restaurant._id.toString(),
          name: restaurant.name,
          description: restaurant.description,
          cuisine: restaurant.cuisine,
          country: restaurant.country,
          currencySymbol: restaurant.currencySymbol || '$',
          imageUrl: restaurant.imageUrl,
          rating: restaurant.rating,
          isActive: restaurant.isActive,
          createdAt: restaurant.createdAt,
          updatedAt: restaurant.updatedAt,
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get restaurants error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching restaurants',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
