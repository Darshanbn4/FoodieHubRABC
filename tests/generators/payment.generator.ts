import * as fc from 'fast-check';
import { PaymentMethod } from '@/types';

// Generator for PaymentMethod
export const paymentMethodArbitrary = fc.record({
  _id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.constantFrom<'credit_card' | 'debit_card' | 'upi'>('credit_card', 'debit_card', 'upi'),
  lastFourDigits: fc.integer({ min: 0, max: 9999 }).map(n => n.toString().padStart(4, '0')),
  isDefault: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

// Generator for PaymentMethod creation data (without _id, timestamps)
export const paymentMethodCreateArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.constantFrom<'credit_card' | 'debit_card' | 'upi'>('credit_card', 'debit_card', 'upi'),
  lastFourDigits: fc.integer({ min: 0, max: 9999 }).map(n => n.toString().padStart(4, '0')),
  isDefault: fc.boolean(),
});

// Generator for PaymentMethod update data (partial)
export const paymentMethodUpdateArbitrary = fc.record({
  name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  type: fc.option(fc.constantFrom<'credit_card' | 'debit_card' | 'upi'>('credit_card', 'debit_card', 'upi'), { nil: undefined }),
  lastFourDigits: fc.option(fc.integer({ min: 0, max: 9999 }).map(n => n.toString().padStart(4, '0')), { nil: undefined }),
  isDefault: fc.option(fc.boolean(), { nil: undefined }),
});
