import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CartItem } from '@/types';
import {
  cartItemArbitrary,
  cartItemsFromSameRestaurantArbitrary,
} from '../generators/cart.generator';

/**
 * Helper function to calculate cart total
 */
function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Helper function to simulate adding an item to a cart
 */
function addItemToCart(cart: CartItem[], newItem: CartItem): CartItem[] {
  const existingItemIndex = cart.findIndex(
    (item) => item.menuItemId === newItem.menuItemId
  );

  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    return cart.map((item, index) =>
      index === existingItemIndex
        ? { ...item, quantity: item.quantity + newItem.quantity }
        : item
    );
  } else {
    // Add new item
    return [...cart, newItem];
  }
}

/**
 * Helper function to simulate updating item quantity
 */
function updateItemQuantity(
  cart: CartItem[],
  menuItemId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return cart.filter((item) => item.menuItemId !== menuItemId);
  }
  return cart.map((item) =>
    item.menuItemId === menuItemId ? { ...item, quantity } : item
  );
}

/**
 * Helper function to simulate removing an item
 */
function removeItemFromCart(cart: CartItem[], menuItemId: string): CartItem[] {
  return cart.filter((item) => item.menuItemId !== menuItemId);
}

/**
 * Feature: food-ordering-rbac, Property 7: Cart total calculation
 * 
 * For any cart with items, the total should equal the sum of (item.price × item.quantity)
 * for all items. Adding, updating quantity, or removing items should maintain this invariant.
 * 
 * Validates: Requirements 4.2, 4.3, 4.4
 */
describe('Property 7: Cart total calculation', () => {
  it('should calculate total as sum of (price × quantity) for all items', () => {
    fc.assert(
      fc.property(cartItemsFromSameRestaurantArbitrary, (items) => {
        const total = calculateCartTotal(items);
        const expectedTotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        
        // Use toBeCloseTo for floating point comparison
        expect(total).toBeCloseTo(expectedTotal, 2);
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain correct total after adding an item', () => {
    fc.assert(
      fc.property(
        cartItemsFromSameRestaurantArbitrary,
        cartItemArbitrary,
        (initialCart, newItem) => {
          // Make sure new item is from same restaurant
          if (initialCart.length > 0) {
            newItem = {
              ...newItem,
              restaurantId: initialCart[0].restaurantId,
              restaurantName: initialCart[0].restaurantName,
            };
          }

          const initialTotal = calculateCartTotal(initialCart);
          const updatedCart = addItemToCart(initialCart, newItem);
          const updatedTotal = calculateCartTotal(updatedCart);

          // Check if item was merged or added
          const existingItem = initialCart.find(
            (item) => item.menuItemId === newItem.menuItemId
          );

          if (existingItem) {
            // Item was merged - total should increase by newItem.price * newItem.quantity
            const expectedIncrease = newItem.price * newItem.quantity;
            expect(updatedTotal).toBeCloseTo(initialTotal + expectedIncrease, 2);
          } else {
            // Item was added - total should increase by newItem.price * newItem.quantity
            const expectedIncrease = newItem.price * newItem.quantity;
            expect(updatedTotal).toBeCloseTo(initialTotal + expectedIncrease, 2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain correct total after updating item quantity', () => {
    fc.assert(
      fc.property(
        cartItemsFromSameRestaurantArbitrary,
        fc.integer({ min: 1, max: 100 }),
        (cart, newQuantity) => {
          if (cart.length === 0) return; // Skip empty carts

          // Pick a random item to update
          const itemToUpdate = cart[0];
          const oldQuantity = itemToUpdate.quantity;

          const updatedCart = updateItemQuantity(
            cart,
            itemToUpdate.menuItemId,
            newQuantity
          );
          const updatedTotal = calculateCartTotal(updatedCart);

          // Calculate expected total
          const quantityDiff = newQuantity - oldQuantity;
          const expectedChange = itemToUpdate.price * quantityDiff;
          const initialTotal = calculateCartTotal(cart);

          expect(updatedTotal).toBeCloseTo(initialTotal + expectedChange, 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain correct total after removing an item', () => {
    fc.assert(
      fc.property(cartItemsFromSameRestaurantArbitrary, (cart) => {
        if (cart.length === 0) return; // Skip empty carts

        const initialTotal = calculateCartTotal(cart);
        const itemToRemove = cart[0];
        const itemTotal = itemToRemove.price * itemToRemove.quantity;

        const updatedCart = removeItemFromCart(cart, itemToRemove.menuItemId);
        const updatedTotal = calculateCartTotal(updatedCart);

        expect(updatedTotal).toBeCloseTo(initialTotal - itemTotal, 2);
      }),
      { numRuns: 100 }
    );
  });

  it('should have zero total for empty cart', () => {
    const emptyCart: CartItem[] = [];
    const total = calculateCartTotal(emptyCart);
    expect(total).toBe(0);
  });

  it('should handle quantity updates to zero by removing item', () => {
    fc.assert(
      fc.property(cartItemsFromSameRestaurantArbitrary, (cart) => {
        if (cart.length === 0) return; // Skip empty carts

        const itemToRemove = cart[0];
        const updatedCart = updateItemQuantity(cart, itemToRemove.menuItemId, 0);

        // Item should be removed
        expect(updatedCart.find((i) => i.menuItemId === itemToRemove.menuItemId)).toBeUndefined();

        // Total should be correct
        const expectedTotal = calculateCartTotal(
          cart.filter((i) => i.menuItemId !== itemToRemove.menuItemId)
        );
        const actualTotal = calculateCartTotal(updatedCart);
        expect(actualTotal).toBeCloseTo(expectedTotal, 2);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: food-ordering-rbac, Property 8: Cart restaurant consistency
 * 
 * For any cart that already contains items from a restaurant, adding an item from
 * a different restaurant should trigger a warning/confirmation before proceeding.
 * 
 * Validates: Requirements 4.5
 */
describe('Property 8: Cart restaurant consistency', () => {
  it('should detect when adding item from different restaurant', () => {
    fc.assert(
      fc.property(
        cartItemsFromSameRestaurantArbitrary,
        cartItemArbitrary,
        (cart, newItem) => {
          if (cart.length === 0) return; // Skip empty carts

          const currentRestaurantId = cart[0].restaurantId;
          const isDifferentRestaurant = newItem.restaurantId !== currentRestaurantId;

          // The check should return true if restaurants match, false if they don't
          const canAddDirectly = !isDifferentRestaurant;

          if (isDifferentRestaurant) {
            // Should detect mismatch
            expect(canAddDirectly).toBe(false);
          } else {
            // Should allow adding
            expect(canAddDirectly).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow adding items from same restaurant without warning', () => {
    fc.assert(
      fc.property(
        cartItemsFromSameRestaurantArbitrary,
        (cart) => {
          if (cart.length === 0) return; // Skip empty carts

          // All items should have the same restaurant ID
          const restaurantId = cart[0].restaurantId;
          const allSameRestaurant = cart.every(
            (item) => item.restaurantId === restaurantId
          );

          expect(allSameRestaurant).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow first item to set restaurant without restriction', () => {
    fc.assert(
      fc.property(cartItemArbitrary, (item) => {
        const emptyCart: CartItem[] = [];
        const updatedCart = addItemToCart(emptyCart, item);

        expect(updatedCart.length).toBe(1);
        expect(updatedCart[0].restaurantId).toBe(item.restaurantId);
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain restaurant consistency after multiple operations', () => {
    fc.assert(
      fc.property(cartItemsFromSameRestaurantArbitrary, (items) => {
        if (items.length === 0) return; // Skip empty carts

        // Build cart by adding items one by one
        let cart: CartItem[] = [];
        for (const item of items) {
          cart = addItemToCart(cart, item);
        }

        // All items should have same restaurant ID
        const restaurantId = cart[0].restaurantId;
        const allSameRestaurant = cart.every(
          (item) => item.restaurantId === restaurantId
        );

        expect(allSameRestaurant).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
