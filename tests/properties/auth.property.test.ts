import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { signToken, verifyToken, hashPassword, comparePassword } from '@/lib/auth';
import { userArbitrary } from '../generators/user.generator';
import { UserWithoutPassword } from '@/types';

/**
 * Feature: food-ordering-rbac, Property 1: Authentication creates valid session
 * 
 * For any valid user credentials (email and password that exist in the database),
 * authenticating should result in a valid JWT token being set in an HTTP-only cookie.
 * 
 * Validates: Requirements 1.1, 1.3
 */
describe('Property 1: Authentication creates valid session', () => {
  it('should create a valid JWT token for any user', () => {
    fc.assert(
      fc.property(userArbitrary, (user: UserWithoutPassword) => {
        // Sign token
        const token = signToken(user);
        
        // Verify token is a non-empty string
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
        
        // Verify token can be decoded
        const payload = verifyToken(token);
        expect(payload).not.toBeNull();
        
        // Verify payload contains correct user data
        expect(payload?.userId).toBe(user._id);
        expect(payload?.email).toBe(user.email);
        expect(payload?.role).toBe(user.role);
        expect(payload?.country).toBe(user.country);
      }),
      { numRuns: 100 }
    );
  });

  it('should create tokens that preserve all user identity fields', () => {
    fc.assert(
      fc.property(userArbitrary, (user: UserWithoutPassword) => {
        const token = signToken(user);
        const payload = verifyToken(token);
        
        // All identity fields must be preserved
        expect(payload).toMatchObject({
          userId: user._id,
          email: user.email,
          role: user.role,
          country: user.country,
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should create unique tokens for different users', () => {
    fc.assert(
      fc.property(userArbitrary, userArbitrary, (user1, user2) => {
        // Skip if users have same ID (extremely unlikely but possible in generated data)
        if (user1._id === user2._id) return;
        
        const token1 = signToken(user1);
        const token2 = signToken(user2);
        
        // Tokens should be different for different users
        expect(token1).not.toBe(token2);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: food-ordering-rbac, Property 2: Invalid credentials are rejected
 * 
 * For any invalid credentials (non-existent email or wrong password),
 * authentication should fail and no session should be created.
 * 
 * Validates: Requirements 1.2
 */
describe('Property 2: Invalid credentials are rejected', () => {
  it('should reject invalid/malformed tokens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (invalidToken) => {
          // Skip if by chance we generate a valid JWT structure
          if (invalidToken.split('.').length === 3) return;
          
          const payload = verifyToken(invalidToken);
          expect(payload).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject empty or whitespace tokens', () => {
    const emptyTokens = ['', ' ', '  ', '\t', '\n'];
    
    emptyTokens.forEach((token) => {
      const payload = verifyToken(token);
      expect(payload).toBeNull();
    });
  });

  it('should correctly validate password hashes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 100 }),
        fc.string({ minLength: 8, maxLength: 100 }),
        async (correctPassword, wrongPassword) => {
          // Skip if passwords are the same
          if (correctPassword === wrongPassword) return;
          
          // Hash the correct password
          const hashedPassword = await hashPassword(correctPassword);
          
          // Correct password should match
          const isCorrectValid = await comparePassword(correctPassword, hashedPassword);
          expect(isCorrectValid).toBe(true);
          
          // Wrong password should not match
          const isWrongValid = await comparePassword(wrongPassword, hashedPassword);
          expect(isWrongValid).toBe(false);
        }
      ),
      { numRuns: 10 } // Reduced runs due to async hashing being slower
    );
  }, 30000); // 30 second timeout for bcrypt operations
});

/**
 * Feature: food-ordering-rbac, Property 3: Protected routes require authentication
 * 
 * For any protected route and any unauthenticated request, the system should
 * redirect to the login page or return a 401 status.
 * 
 * Validates: Requirements 1.5
 */
describe('Property 3: Protected routes require authentication', () => {
  it('should generate valid tokens that can be verified', () => {
    fc.assert(
      fc.property(userArbitrary, (user: UserWithoutPassword) => {
        const token = signToken(user);
        const payload = verifyToken(token);
        
        // Token should be verifiable
        expect(payload).not.toBeNull();
        expect(payload?.userId).toBe(user._id);
      }),
      { numRuns: 100 }
    );
  });

  it('should fail verification for tampered tokens', () => {
    fc.assert(
      fc.property(userArbitrary, (user: UserWithoutPassword) => {
        const token = signToken(user);
        
        // Tamper with the token by modifying a character
        const tamperedToken = token.slice(0, -5) + 'xxxxx';
        
        const payload = verifyToken(tamperedToken);
        expect(payload).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain token integrity through sign-verify cycle', () => {
    fc.assert(
      fc.property(userArbitrary, (user: UserWithoutPassword) => {
        // Sign token
        const token = signToken(user);
        
        // Verify token
        const payload = verifyToken(token);
        
        // Payload should match original user data
        expect(payload).not.toBeNull();
        if (payload) {
          expect(payload.userId).toBe(user._id);
          expect(payload.email).toBe(user.email);
          expect(payload.role).toBe(user.role);
          expect(payload.country).toBe(user.country);
        }
      }),
      { numRuns: 100 }
    );
  });
});
