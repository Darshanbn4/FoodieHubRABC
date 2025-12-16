# Implementation Plan

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize Next.js 14 project with TypeScript and Tailwind CSS
    - Run `npx create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint
    - Configure `tsconfig.json` with path aliases
    - Set up Tailwind for dark mode (`class` strategy)
    - _Requirements: Tech Stack_
  - [x] 1.2 Set up MongoDB connection and Mongoose
    - Install mongoose and create `src/lib/db.ts` connection utility
    - Create `.env.local` with `MONGODB_URI` and `JWT_SECRET`
    - Implement connection pooling for serverless environment
    - _Requirements: Tech Stack_
  - [x] 1.3 Set up testing infrastructure
    - Install vitest, @testing-library/react, fast-check
    - Configure `vitest.config.ts` with path aliases
    - Create test directory structure
    - _Requirements: Tech Stack_

- [ ] 2. Data Models and Type Definitions
  - [x] 2.1 Create TypeScript type definitions
    - Create `src/types/index.ts` with User, Restaurant, MenuItem, Order, PaymentMethod interfaces
    - Define Role, Permission, Country types
    - Define API response types (ApiSuccess, ApiError)
    - _Requirements: 2.1, 3.3, 4.4_
  - [x] 2.2 Create Mongoose schemas and models
    - Create User, Restaurant, MenuItem, Order, PaymentMethod models
    - _Requirements: 3.1, 4.1, 6.1, 7.1_
  - [x] 2.3 Write property test for Order serialization round-trip
    - **Property 14: Order serialization round-trip**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [x] 3. RBAC System Implementation
  - [x] 3.1 Implement permission utilities
    - Create `src/lib/rbac.ts` with ROLE_PERMISSIONS matrix
    - Implement `hasPermission` and `canAccessCountry` functions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 3.2 Write property test for permission-based action blocking
    - **Property 4: Permission-based action blocking**
    - **Validates: Requirements 2.4, 2.5, 5.2, 6.2, 7.4**
  - [x] 3.3 Write property test for country-scoped data access
    - **Property 5: Country-scoped data access**
    - **Validates: Requirements 3.1, 3.4, 8.1, 8.2, 8.3**

- [x] 4. Authentication System
  - [x] 4.1 Implement JWT utilities
    - Create `src/lib/auth.ts` with signToken, verifyToken, password hashing
    - _Requirements: 1.1, 1.3_
  - [x] 4.2 Create authentication API routes
    - POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 4.3 Implement Next.js middleware for route protection
    - Create `src/middleware.ts` with JWT verification
    - _Requirements: 1.5, 2.4_
  - [x] 4.4 Write property tests for authentication
    - **Property 1: Authentication creates valid session**
    - **Property 2: Invalid credentials are rejected**
    - **Property 3: Protected routes require authentication**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

- [x] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Auth Context and Login UI
  - [x] 6.1 Create AuthContext provider
    - Create `src/contexts/AuthContext.tsx`
    - _Requirements: 1.1, 1.3, 1.4_
  - [x] 6.2 Create Login page
    - Create `src/app/(auth)/login/page.tsx` with form validation
    - _Requirements: 1.1, 1.2_
  - [x] 6.3 Create reusable UI components
    - Button, Input, Card components with dark mode support
    - _Requirements: 9.1_

- [x] 7. Theme System
  - [x] 7.1 Implement ThemeContext and toggle
    - Create `src/contexts/ThemeContext.tsx` with localStorage persistence
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 7.2 Create ThemeToggle component
    - _Requirements: 9.1_
  - [x] 7.3 Write property test for theme persistence
    - **Property 13: Theme persistence round-trip**
    - **Validates: Requirements 9.2, 9.3**

- [x] 8. Layout and Navigation
  - [x] 8.1 Create main layout with role-based navigation
    - Sidebar with role-filtered nav items, Header with user info
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 8.2 Create PermissionGuard component
    - _Requirements: 2.4, 2.5_
  - [x] 8.3 Set up app layout structure
    - _Requirements: 2.1_

- [x] 9. Restaurant and Menu Features
  - [x] 9.1 Create Restaurant API routes
    - GET /api/restaurants with country filtering
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  - [x] 9.2 Create Restaurant list page
    - _Requirements: 3.1, 3.3_
  - [x] 9.3 Create Restaurant detail page with menu
    - _Requirements: 3.2, 3.3, 4.1_
  - [x] 9.4 Write property test for menu items
    - **Property 6: Menu items belong to restaurant**
    - **Validates: Requirements 3.2**

- [x] 10. Cart System
  - [x] 10.1 Create Cart context and state management
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  - [x] 10.2 Create Cart page and components
    - _Requirements: 4.4, 5.1_
  - [x] 10.3 Write property tests for cart operations
    - **Property 7: Cart total calculation**
    - **Property 8: Cart restaurant consistency**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

- [x] 11. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Order Management
  - [x] 12.1 Create Order API routes
    - GET/POST /api/orders, POST /api/orders/[id]/cancel
    - _Requirements: 5.3, 6.1, 6.3, 6.4_
  - [x] 12.2 Implement checkout flow
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  - [x] 12.3 Create Orders list page
    - _Requirements: 6.1, 6.2_
  - [x] 12.4 Write property tests for order operations
    - **Property 9: Order placement creates record**
    - **Property 10: Order cancellation updates status**
    - **Property 11: Country-scoped order cancellation**
    - **Validates: Requirements 5.3, 5.4, 6.1, 6.3, 6.4**

- [x] 13. Payment Method Management
  - [x] 13.1 Create Payment Method API routes (Admin only)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 13.2 Create Payment Methods settings page
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 13.3 Write property test for payment method CRUD
    - **Property 12: Payment method CRUD for Admin**
    - **Validates: Requirements 7.2, 7.3, 7.5**

- [x] 14. Database Seeding
  - [x] 14.1 Create seed script with sample data
    - Add users: Nick Fury (Admin), Captain Marvel/America (Managers), Thanos/Thor/Travis (Members)
    - Add restaurants and menu items for India and America
    - _Requirements: All_

- [x] 15. Final Integration
  - [x] 15.1 Create home page with redirect logic
    - _Requirements: 1.3_
  - [x] 15.2 Add loading states and error boundaries
    - _Requirements: All_
  - [x] 15.3 Create README with setup instructions
    - _Requirements: Submission_

- [x] 16. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
