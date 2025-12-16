'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Restaurant, MenuItem, ApiResponse } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
const MENU_PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, clearCart, restaurantId: cartRestaurantId } = useCart();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showRestaurantMismatchDialog, setShowRestaurantMismatchDialog] = useState(false);
  const [restaurantImgSrc, setRestaurantImgSrc] = useState(PLACEHOLDER_IMAGE);
  const [menuImgSrcs, setMenuImgSrcs] = useState<Record<string, string>>({});
  const [pendingItem, setPendingItem] = useState<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    restaurantId: string;
    restaurantName: string;
  } | null>(null);

  const fetchRestaurantDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/restaurants/${params.id}`);
      const data: ApiResponse<{ restaurant: Restaurant; menuItems: MenuItem[] }> =
        await response.json();

      if (data.success) {
        setRestaurant(data.data.restaurant);
        setMenuItems(data.data.menuItems);
        setRestaurantImgSrc(data.data.restaurant.imageUrl || PLACEHOLDER_IMAGE);
        // Initialize menu image sources
        const imgSrcs: Record<string, string> = {};
        data.data.menuItems.forEach((item: MenuItem) => {
          imgSrcs[item._id] = item.imageUrl || MENU_PLACEHOLDER;
        });
        setMenuImgSrcs(imgSrcs);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to load restaurant details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, [params.id]);

  const handleQuantityChange = (menuItemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[menuItemId] || 1;
      const newQuantity = Math.max(1, current + delta);
      return { ...prev, [menuItemId]: newQuantity };
    });
  };

  const handleAddToCart = async (menuItem: MenuItem) => {
    const quantity = quantities[menuItem._id] || 1;

    const cartItem = {
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      restaurantId: restaurant!._id,
      restaurantName: restaurant!.name,
      currencySymbol: restaurant!.currencySymbol,
    };

    const success = await addItem(cartItem);

    if (!success) {
      // Restaurant mismatch - show confirmation dialog
      setPendingItem(cartItem);
      setShowRestaurantMismatchDialog(true);
    } else {
      // Reset quantity after successful add
      setQuantities((prev) => ({ ...prev, [menuItem._id]: 1 }));
    }
  };

  const handleConfirmClearCart = async () => {
    if (pendingItem) {
      clearCart();
      await addItem(pendingItem);
      setPendingItem(null);
      setShowRestaurantMismatchDialog(false);
    }
  };

  const handleCancelClearCart = () => {
    setPendingItem(null);
    setShowRestaurantMismatchDialog(false);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading restaurant details..." />;
  }

  if (error || !restaurant) {
    return (
      <ErrorMessage
        title="Failed to Load Restaurant"
        message={error || 'Restaurant not found'}
        onRetry={fetchRestaurantDetails}
      />
    );
  }

  // Group menu items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div>
      {/* Restaurant Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/restaurants')}
          className="mb-4"
        >
          ← Back to Restaurants
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="aspect-[21/9] w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={restaurantImgSrc}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={() => setRestaurantImgSrc(PLACEHOLDER_IMAGE)}
            />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                  {restaurant.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {restaurant.cuisine}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {restaurant.country}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Menu
        </h2>

        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No menu items available at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(itemsByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const quantity = quantities[item._id] || 1;
                    return (
                      <Card key={item._id}>
                        <div className="flex gap-4">
                          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                            <img
                              src={menuImgSrcs[item._id] || MENU_PLACEHOLDER}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={() => setMenuImgSrcs(prev => ({ ...prev, [item._id]: MENU_PLACEHOLDER }))}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardHeader className="p-0 mb-2">
                              <CardTitle className="text-base">
                                {item.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {restaurant.currencySymbol}{item.price.toFixed(2)}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                                  <button
                                    onClick={() => handleQuantityChange(item._id, -1)}
                                    className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 border-x border-gray-300 dark:border-gray-600 min-w-[40px] text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item._id, 1)}
                                    className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  Add to Cart
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Mismatch Dialog */}
      {showRestaurantMismatchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Clear Cart?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your cart contains items from a different restaurant. Would you like to
                clear your cart and add items from {restaurant.name}?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={handleCancelClearCart}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirmClearCart}>
                  Clear Cart & Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
