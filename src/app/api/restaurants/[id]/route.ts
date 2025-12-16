import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RestaurantModel from '@/models/Restaurant';
import MenuItemModel from '@/models/MenuItem';
import { ApiResponse, Restaurant, MenuItem } from '@/types';

/**
 * GET /api/restaurants/[id]
 * Fetch a specific restaurant with its menu items - TEMPORARILY NO AUTH REQUIRED
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Fetch restaurant
    const restaurant = await RestaurantModel.findById(params.id);

    if (!restaurant) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Fetch menu items for this restaurant
    const menuItems = await MenuItemModel.find({
      restaurantId: params.id,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    const restaurantData: Restaurant = {
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
    };

    const menuItemsData: MenuItem[] = menuItems.map((item) => ({
      _id: item._id.toString(),
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const response: ApiResponse<{ restaurant: Restaurant; menuItems: MenuItem[] }> = {
      success: true,
      data: {
        restaurant: restaurantData,
        menuItems: menuItemsData,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get restaurant error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching restaurant details',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
