import * as fc from 'fast-check';
import { Role, Country, UserWithoutPassword } from '@/types';

// Generator for User (without password)
export const userArbitrary = fc.record({
  _id: fc.uuid(),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constantFrom<Role>('admin', 'manager', 'member'),
  country: fc.constantFrom<Country>('india', 'america'),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

// Generator for specific roles
export const adminUserArbitrary = fc.record({
  _id: fc.uuid(),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constant<Role>('admin'),
  country: fc.constantFrom<Country>('india', 'america'),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

export const managerUserArbitrary = fc.record({
  _id: fc.uuid(),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constant<Role>('manager'),
  country: fc.constantFrom<Country>('india', 'america'),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

export const memberUserArbitrary = fc.record({
  _id: fc.uuid(),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constant<Role>('member'),
  country: fc.constantFrom<Country>('india', 'america'),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});
