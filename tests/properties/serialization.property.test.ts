import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { orderArbitrary } from '../generators/order.generator';
import { Order } from '@/types';

/**
 * Feature: food-ordering-rbac, Property 14: Order serialization round-trip
 * 
 * For any valid Order object, serializing to JSON and deserializing back
 * should produce an equivalent Order object with all fields preserved.
 * 
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4
 */
describe('Property 14: Order serialization round-trip', () => {
  it('should preserve all order fields through JSON serialization round-trip', () => {
    fc.assert(
      fc.property(orderArbitrary, (order: Order) => {
        // Serialize to JSON
        const serialized = JSON.stringify(order);
        
        // Deserialize back
        const deserialized = JSON.parse(serialized);
        
        // Verify all fields are preserved
        expect(deserialized._id).toBe(order._id);
        expect(deserialized.userId).toBe(order.userId);
        expect(deserialized.restaurantId).toBe(order.restaurantId);
        expect(deserialized.status).toBe(order.status);
        expect(deserialized.total).toBe(order.total);
        expect(deserialized.country).toBe(order.country);
        
        // Verify items array
        expect(deserialized.items).toHaveLength(order.items.length);
        order.items.forEach((item, index) => {
          expect(deserialized.items[index].menuItemId).toBe(item.menuItemId);
          expect(deserialized.items[index].name).toBe(item.name);
          expect(deserialized.items[index].price).toBe(item.price);
          expect(deserialized.items[index].quantity).toBe(item.quantity);
        });
        
        // Verify optional fields
        if (order.paymentMethodId) {
          expect(deserialized.paymentMethodId).toBe(order.paymentMethodId);
        }
        if (order.cancelReason) {
          expect(deserialized.cancelReason).toBe(order.cancelReason);
        }
        
        // Dates are serialized as ISO strings, so we compare the string representation
        expect(new Date(deserialized.createdAt).toISOString()).toBe(order.createdAt.toISOString());
        expect(new Date(deserialized.updatedAt).toISOString()).toBe(order.updatedAt.toISOString());
        
        if (order.cancelledAt) {
          expect(new Date(deserialized.cancelledAt).toISOString()).toBe(order.cancelledAt.toISOString());
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should validate order structure after deserialization', () => {
    fc.assert(
      fc.property(orderArbitrary, (order: Order) => {
        const serialized = JSON.stringify(order);
        const deserialized = JSON.parse(serialized);
        
        // Validate structure
        expect(deserialized).toHaveProperty('_id');
        expect(deserialized).toHaveProperty('userId');
        expect(deserialized).toHaveProperty('restaurantId');
        expect(deserialized).toHaveProperty('items');
        expect(deserialized).toHaveProperty('status');
        expect(deserialized).toHaveProperty('total');
        expect(deserialized).toHaveProperty('country');
        expect(deserialized).toHaveProperty('createdAt');
        expect(deserialized).toHaveProperty('updatedAt');
        
        // Validate items structure
        expect(Array.isArray(deserialized.items)).toBe(true);
        expect(deserialized.items.length).toBeGreaterThan(0);
        
        deserialized.items.forEach((item: any) => {
          expect(item).toHaveProperty('menuItemId');
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('price');
          expect(item).toHaveProperty('quantity');
        });
      }),
      { numRuns: 100 }
    );
  });
});
