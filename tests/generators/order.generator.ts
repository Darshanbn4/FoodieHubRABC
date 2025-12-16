import * as fc from 'fast-check';
import { Order, OrderItem, OrderStatus, Country } from '@/types';

// Generator for OrderItem
export const orderItemArbitrary = fc.record({
  menuItemId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true }),
  quantity: fc.integer({ min: 1, max: 100 }),
});

// Generator for Order
export const orderArbitrary = fc.record({
  _id: fc.uuid(),
  userId: fc.uuid(),
  restaurantId: fc.uuid(),
  items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 20 }),
  status: fc.constantFrom<OrderStatus>('pending', 'placed', 'cancelled'),
  total: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
  country: fc.constantFrom<Country>('india', 'america'),
  paymentMethodId: fc.option(fc.uuid(), { nil: undefined }),
  cancelledAt: fc.option(fc.date(), { nil: undefined }),
  cancelReason: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});
