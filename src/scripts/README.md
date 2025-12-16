# Database Seeding Script

This directory contains the database seeding script for the Food Ordering RBAC application.

## Overview

The seed script (`seed.ts`) populates the MongoDB database with sample data including:
- 6 users (1 Admin, 2 Managers, 3 Team Members)
- 6 restaurants (3 in India, 3 in America)
- Menu items for each restaurant
- 3 payment methods

## Prerequisites

Before running the seed script, ensure:
1. MongoDB is installed and running locally, OR you have a MongoDB Atlas connection string
2. The `.env.local` file exists with a valid `MONGODB_URI`

## Usage

Run the seed script using:

```bash
npm run seed
```

## Sample Data

### Users

All users have the password: `password123`

| Name | Email | Role | Country |
|------|-------|------|---------|
| Nick Fury | nick@slooze.com | Admin | America |
| Captain Marvel | marvel@slooze.com | Manager | India |
| Captain America | america@slooze.com | Manager | America |
| Thanos | thanos@slooze.com | Member | India |
| Thor | thor@slooze.com | Member | India |
| Travis | travis@slooze.com | Member | America |

### Restaurants

**India:**
- Spice Garden (North Indian)
- Dosa Palace (South Indian)
- Mumbai Street Food (Street Food)

**America:**
- The Burger Joint (American)
- Pizza Paradise (Italian-American)
- Taco Fiesta (Mexican)

### Menu Items

Each restaurant has 3-4 menu items with realistic prices:
- India: Prices in INR (₹)
- America: Prices in USD ($)

### Payment Methods

- Visa Credit Card (****4242) - Default
- Mastercard Debit (****5555)
- UPI Payment (****9876)

## What the Script Does

1. **Connects to MongoDB** using the URI from `.env.local`
2. **Clears existing data** from all collections (Users, Restaurants, MenuItems, PaymentMethods)
3. **Seeds users** with hashed passwords
4. **Seeds restaurants** for both countries
5. **Seeds menu items** for each restaurant
6. **Seeds payment methods**
7. **Displays success message** with login credentials

## Notes

- The script will **delete all existing data** before seeding
- All passwords are hashed using bcrypt
- Restaurant and menu item images use placeholder paths
- The script exits automatically after completion

## Troubleshooting

### MongoDB Connection Error

If you see `MongooseServerSelectionError: connect ECONNREFUSED`:

1. **Local MongoDB:** Ensure MongoDB is running:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **MongoDB Atlas:** Update `.env.local` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-ordering?retryWrites=true&w=majority
   ```

### Permission Errors

Ensure the MongoDB user has write permissions to the database.

## Development

To modify the seed data, edit the arrays in `seed.ts`:
- `users` array for user data
- `restaurants` array for restaurant data
- `menuItems` array for menu items
- `paymentMethods` array for payment methods
