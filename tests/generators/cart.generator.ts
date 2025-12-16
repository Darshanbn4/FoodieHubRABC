import * as fc from 'fast-check';
import { CartItem } from '@/types';

// Generator for CartItem
export const cartItemArbitrary = fc.record({
  menuItemId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true }),
  quantity: fc.integer({ min: 1, max: 100 }),
  restaurantId: fc.uuid(),
  restaurantName: fc.string({ minLength: 1, maxLength: 100 }),
});

// Generator for a cart item from a specific restaurant
export const cartItemForRestaurantArbitrary = (restaurantId: string, restaurantName: string) =>
  fc.record({
    menuItemId: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true }),
    quantity: fc.integer({ min: 1, max: 100 }),
    restaurantId: fc.constant(restaurantId),
    restaurantName: fc.constant(restaurantName),
  });

// Generator for an array of cart items from the same restaurant
export const cartItemsFromSameRestaurantArbitrary = fc
  .tuple(fc.uuid(), fc.string({ minLength: 1, maxLength: 100 }))
  .chain(([restaurantId, restaurantName]) =>
    fc.array(cartItemForRestaurantArbitrary(restaurantId, restaurantName), {
      minLength: 1,
      maxLength: 20,
    })
  );
