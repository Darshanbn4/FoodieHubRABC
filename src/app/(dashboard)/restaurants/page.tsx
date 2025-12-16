'use client';

import { useEffect, useState } from 'react';
import { Restaurant, ApiResponse } from '@/types';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/restaurants');
      const data: ApiResponse<{ restaurants: Restaurant[] }> = await response.json();

      if (data.success) {
        setRestaurants(data.data.restaurants);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading restaurants..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Restaurants"
        message={error}
        onRetry={fetchRestaurants}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Restaurants
      </h1>
      
      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No restaurants available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
