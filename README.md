# Food Ordering RBAC System

A full-stack food ordering web application built with Next.js 14, featuring Role-Based Access Control (RBAC) and country-based data isolation.

## Features

- **Role-Based Access Control**: Three user roles (Admin, Manager, Team Member) with different permission levels
- **Country-Based Data Isolation**: Managers and Team Members can only access data within their assigned country
- **Authentication**: Secure JWT-based authentication with HTTP-only cookies
- **Restaurant Browsing**: View restaurants and menu items filtered by country
- **Cart Management**: Add items to cart with restaurant consistency validation
- **Order Management**: Place and cancel orders based on role permissions
- **Payment Methods**: Admin-only payment method management
- **Dark Mode**: System-wide theme switching with localStorage persistence
- **Property-Based Testing**: Comprehensive test suite using fast-check

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (React) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Authentication | JWT with HTTP-only cookies |
| Testing | Vitest + fast-check (property-based testing) |

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd food-ordering-rbac
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/food-ordering-rbac
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Replace `your-super-secret-jwt-key-change-this-in-production` with a strong, random secret key.

### 4. Seed the database

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 6 demo users with different roles and countries
- Sample restaurants in India and America
- Menu items for each restaurant

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After seeding, you can log in with these accounts:

| Email | Password | Role | Country |
|-------|----------|------|---------|
| nick@slooze.com | password123 | Admin | America |
| marvel@slooze.com | password123 | Manager | India |
| america@slooze.com | password123 | Manager | America |
| thanos@slooze.com | password123 | Team Member | India |
| thor@slooze.com | password123 | Team Member | India |
| travis@slooze.com | password123 | Team Member | America |

## User Roles & Permissions

### Admin (Nick Fury)
- Full system access across all countries
- Can view all restaurants and orders
- Can place and cancel orders
- Can manage payment methods
- No country restrictions

### Manager (Captain Marvel, Captain America)
- Elevated permissions within assigned country
- Can view restaurants in their country
- Can place and cancel orders in their country
- Cannot manage payment methods
- Country-scoped data access

### Team Member (Thanos, Thor, Travis)
- Basic permissions within assigned country
- Can view restaurants in their country
- Can add items to cart
- Cannot place or cancel orders
- Country-scoped data access

## Project Structure

```
food-ordering-rbac/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── restaurants/
│   │   │   ├── orders/
│   │   │   ├── cart/
│   │   │   └── settings/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── orders/
│   │   │   └── payments/
│   │   ├── login/             # Login page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React Components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   └── cart/             # Cart-specific components
│   ├── contexts/             # React Contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── CartContext.tsx
│   ├── lib/                  # Utilities & Config
│   │   ├── db.ts            # MongoDB connection
│   │   ├── auth.ts          # JWT utilities
│   │   └── rbac.ts          # Permission utilities
│   ├── models/              # Mongoose Models
│   ├── scripts/             # Database scripts
│   │   └── seed.ts
│   └── types/               # TypeScript Types
├── tests/                   # Test files
│   ├── properties/          # Property-based tests
│   ├── generators/          # Test data generators
│   └── unit/               # Unit tests
├── .env.local              # Environment variables
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run seed` - Seed database with sample data

## Testing

The project includes comprehensive testing using Vitest and fast-check for property-based testing.

### Run all tests

```bash
npm run test:run
```

### Run tests in watch mode

```bash
npm run test
```

### Test Coverage

The test suite includes:
- **Property-based tests**: Validate universal properties across all inputs
- **Unit tests**: Test specific functionality and edge cases
- **Integration tests**: Test API routes and database operations

Key properties tested:
- Authentication creates valid sessions
- Permission-based action blocking
- Country-scoped data access
- Cart total calculation
- Order lifecycle (placement and cancellation)
- Theme persistence
- Order serialization round-trip

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Orders
- `GET /api/orders` - Get user's orders (country-filtered)
- `POST /api/orders` - Create new order
- `POST /api/orders/[id]/cancel` - Cancel order

### Payment Methods (Admin only)
- `GET /api/payments` - Get all payment methods
- `POST /api/payments` - Create payment method
- `PUT /api/payments/[id]` - Update payment method
- `DELETE /api/payments/[id]` - Delete payment method

## Key Features Explained

### Role-Based Access Control (RBAC)

The system implements a permission matrix that maps roles to specific actions:

```typescript
const ROLE_PERMISSIONS = {
  admin: ['view_restaurants', 'create_order', 'place_order', 'cancel_order', 'manage_payments'],
  manager: ['view_restaurants', 'create_order', 'place_order', 'cancel_order'],
  member: ['view_restaurants', 'create_order'],
};
```

### Country-Based Data Isolation

Non-Admin users can only access data within their assigned country:
- Restaurant listings are filtered by country
- Orders are scoped to the user's country
- Managers cannot cancel orders from other countries

### Cart Management

- Users can add items from one restaurant at a time
- Adding items from a different restaurant triggers a warning
- Cart total is automatically calculated
- Cart is cleared after successful checkout

### Theme System

- Light and dark mode support
- Theme preference persisted in localStorage
- Automatic theme application on page load
- System-wide theme toggle

## Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing using bcrypt
- Route protection via Next.js middleware
- Permission checks on both client and server
- Country-scoped data access validation

## Development Notes

### Adding New Permissions

1. Add the permission to the `Permission` type in `src/types/index.ts`
2. Update the `ROLE_PERMISSIONS` matrix in `src/lib/rbac.ts`
3. Use `hasPermission()` to check permissions in components and API routes

### Adding New Routes

1. Create the route in `src/app/(dashboard)/`
2. Add navigation item in `src/components/layout/Sidebar.tsx`
3. Specify required roles for the navigation item
4. Implement permission checks in the page component

### Database Schema Changes

1. Update the TypeScript interface in `src/types/index.ts`
2. Update the Mongoose schema in `src/models/`
3. Update the seed script if needed
4. Re-run the seed script to populate new fields

## Troubleshooting

### MongoDB Connection Issues

If you see connection errors:
1. Ensure MongoDB is running
2. Check the `MONGODB_URI` in `.env.local`
3. Verify network connectivity to MongoDB

### Authentication Issues

If login fails:
1. Check that the database is seeded
2. Verify the `JWT_SECRET` is set in `.env.local`
3. Clear browser cookies and try again

### Build Errors

If you encounter build errors:
1. Delete `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`

## Deployment

### Recommended: Vercel (Next.js creators)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository
   - Add environment variables in Vercel dashboard:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A strong secret key for JWT signing
   - Click Deploy

3. **Seed production database**:
```bash
# Set production MongoDB URI and run seed
MONGODB_URI="your-production-mongodb-uri" npx tsx src/scripts/seed.ts
```

### Alternative: Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Alternative: Render

1. Connect GitHub repo to Render
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables in dashboard

### Not Recommended: Netlify

This app uses Next.js API routes which are not compatible with Netlify's static hosting. Use Vercel, Railway, or Render instead.

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue in the repository.
