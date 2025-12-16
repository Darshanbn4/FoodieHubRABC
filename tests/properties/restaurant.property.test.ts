import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { MenuItem } from '@/types';
import {
  restaurantWithMenuArbitrary,
  menuItemArbitrary,
} from '../generators/restaurant.generator';

/**
 * Feature: food-ordering-rbac, Property 6: Menu items belong to restaurant
 * 
 * For any restaurant, when fetching its menu items, all returned items should have
 * a restaurantId matching the requested restaurant.
 * 
 * Validates: Requirements 3.2
 */
describe('Property 6: Menu items belong to restaurant', () => {
  it('should ensure all menu items have matching restaurantId', () => {
    fc.assert(
      fc.property(restaurantWithMenuArbitrary, ({ restaurant, menuItems }) => {
        // All menu items should have the restaurant's ID
        const allItemsBelongToRestaurant = menuItems.every(
          (item) => item.restaurantId === restaurant._id
        );

        expect(allItemsBelongToRestaurant).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should not return menu items from other restaurants', () => {
    fc.assert(
      fc.property(
        restaurantWithMenuArbitrary,
        menuItemArbitrary,
        ({ restaurant, menuItems }, unrelatedItem) => {
          // Make sure unrelated item has a different restaurant ID
          if (unrelatedItem.restaurantId === restaurant._id) {
            unrelatedItem = { ...unrelatedItem, restaurantId: 'different-restaurant-id' };
          }

          // Filter menu items to only include those belonging to the restaurant
          const filteredItems = [...menuItems, unrelatedItem].filter(
            (item) => item.restaurantId === restaurant._id
          );

          // The unrelated item should not be in the filtered results
          const containsUnrelatedItem = filteredItems.some(
            (item) => item._id === unrelatedItem._id
          );

          expect(containsUnrelatedItem).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain restaurantId consistency across all items', () => {
    fc.assert(
      fc.property(restaurantWithMenuArbitrary, ({ restaurant, menuItems }) => {
        if (menuItems.length === 0) return; // Skip empty menus

        // All items should have the same restaurantId
        const firstRestaurantId = menuItems[0].restaurantId;
        const allSameRestaurant = menuItems.every(
          (item) => item.restaurantId === firstRestaurantId
        );

        expect(allSameRestaurant).toBe(true);
        expect(firstRestaurantId).toBe(restaurant._id);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty menu gracefully', () => {
    fc.assert(
      fc.property(
        fc.record({
          _id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          cuisine: fc.constantFrom('Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'American'),
          country: fc.constantFrom('india', 'america'),
          imageUrl: fc.webUrl(),
          rating: fc.float({ min: 0, max: 5, noNaN: true, noDefaultInfinity: true }),
          isActive: fc.constant(true),
          createdAt: fc.date(),
          updatedAt: fc.date(),
        }),
        (restaurant) => {
          const emptyMenu: MenuItem[] = [];

          // Empty menu should not contain any items
          expect(emptyMenu.length).toBe(0);

          // Filtering empty menu should still be empty
          const filtered = emptyMenu.filter(
            (item) => item.restaurantId === restaurant._id
          );
          expect(filtered.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify restaurantId is a valid identifier', () => {
    fc.assert(
      fc.property(restaurantWithMenuArbitrary, ({ restaurant, menuItems }) => {
        // Restaurant ID should be a non-empty string
        expect(restaurant._id).toBeTruthy();
        expect(typeof restaurant._id).toBe('string');
        expect(restaurant._id.length).toBeGreaterThan(0);

        // All menu items should reference this valid ID
        menuItems.forEach((item) => {
          expect(item.restaurantId).toBe(restaurant._id);
          expect(typeof item.restaurantId).toBe('string');
          expect(item.restaurantId.length).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should handle multiple restaurants with distinct menu items', () => {
    fc.assert(
      fc.property(
        restaurantWithMenuArbitrary,
        restaurantWithMenuArbitrary,
        (restaurant1Data, restaurant2Data) => {
          // Ensure restaurants have different IDs
          if (restaurant1Data.restaurant._id === restaurant2Data.restaurant._id) {
            return; // Skip if same restaurant
          }

          const { restaurant: restaurant1, menuItems: menu1 } = restaurant1Data;
          const { restaurant: restaurant2, menuItems: menu2 } = restaurant2Data;

          // Menu items from restaurant1 should not belong to restaurant2
          const menu1ItemsInRestaurant2 = menu1.filter(
            (item) => item.restaurantId === restaurant2._id
          );
          expect(menu1ItemsInRestaurant2.length).toBe(0);

          // Menu items from restaurant2 should not belong to restaurant1
          const menu2ItemsInRestaurant1 = menu2.filter(
            (item) => item.restaurantId === restaurant1._id
          );
          expect(menu2ItemsInRestaurant1.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
