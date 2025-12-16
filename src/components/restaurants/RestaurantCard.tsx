'use client';

import { useState } from 'react';
import { Restaurant } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(restaurant.imageUrl || PLACEHOLDER_IMAGE);

  const handleClick = () => {
    router.push(`/restaurants/${restaurant._id}`);
  };

  const handleImageError = () => {
    setImgSrc(PLACEHOLDER_IMAGE);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
        <img
          src={imgSrc}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      <CardHeader>
        <CardTitle>{restaurant.name}</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {restaurant.cuisine}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {restaurant.description}
        </p>
      </CardContent>
    </Card>
  );
}
