import * as fc from 'fast-check';
import { Restaurant, MenuItem, Country } from '@/types';

// Generator for Country
export const countryArbitrary = fc.constantFrom<Country>('india', 'america');

// Generator for Restaurant
export const restaurantArbitrary = fc.record({
  _id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  cuisine: fc.constantFrom('Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'American'),
  country: countryArbitrary,
  imageUrl: fc.webUrl(),
  rating: fc.float({ min: 0, max: 5, noNaN: true, noDefaultInfinity: true }),
  isActive: fc.constant(true),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

// Generator for MenuItem
export const menuItemArbitrary = fc.record({
  _id: fc.uuid(),
  restaurantId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true }),
  category: fc.constantFrom('Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish'),
  imageUrl: fc.webUrl(),
  isAvailable: fc.constant(true),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

// Generator for MenuItem belonging to a specific restaurant
export const menuItemForRestaurantArbitrary = (restaurantId: string) =>
  fc.record({
    _id: fc.uuid(),
    restaurantId: fc.constant(restaurantId),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 10, maxLength: 500 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true }),
    category: fc.constantFrom('Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish'),
    imageUrl: fc.webUrl(),
    isAvailable: fc.constant(true),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

// Generator for a restaurant with its menu items
export const restaurantWithMenuArbitrary = restaurantArbitrary.chain((restaurant) =>
  fc
    .array(menuItemForRestaurantArbitrary(restaurant._id), {
      minLength: 1,
      maxLength: 30,
    })
    .map((menuItems) => ({ restaurant, menuItems }))
);
