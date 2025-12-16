import mongoose from 'mongoose';
import { hashPassword } from '@/lib/auth';
import UserModel from '@/models/User';
import RestaurantModel from '@/models/Restaurant';
import MenuItemModel from '@/models/MenuItem';
import PaymentMethodModel from '@/models/PaymentMethod';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-ordering-rbac';

// Validate MongoDB URI
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not found in .env.local, using default: mongodb://localhost:27017/food-ordering-rbac');
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await UserModel.deleteMany({});
  await RestaurantModel.deleteMany({});
  await MenuItemModel.deleteMany({});
  await PaymentMethodModel.deleteMany({});
  console.log('✅ Database cleared');
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const defaultPassword = await hashPassword('password123');
  
  const users = [
    {
      email: 'nick@slooze.com',
      password: defaultPassword,
      name: 'Nick Fury',
      role: 'admin',
      country: 'america',
    },
    {
      email: 'marvel@slooze.com',
      password: defaultPassword,
      name: 'Captain Marvel',
      role: 'manager',
      country: 'india',
    },
    {
      email: 'america@slooze.com',
      password: defaultPassword,
      name: 'Captain America',
      role: 'manager',
      country: 'america',
    },
    {
      email: 'thanos@slooze.com',
      password: defaultPassword,
      name: 'Thanos',
      role: 'member',
      country: 'india',
    },
    {
      email: 'thor@slooze.com',
      password: defaultPassword,
      name: 'Thor',
      role: 'member',
      country: 'india',
    },
    {
      email: 'travis@slooze.com',
      password: defaultPassword,
      name: 'Travis',
      role: 'member',
      country: 'america',
    },
  ];

  await UserModel.insertMany(users);
  console.log(`✅ Created ${users.length} users (password: password123)`);
}

async function seedRestaurants() {
  console.log('🍽️  Seeding restaurants...');
  
  const restaurants = [
    // India Restaurants
    {
      name: 'Spice Garden',
      description: 'Authentic North Indian cuisine with traditional flavors',
      cuisine: 'North Indian',
      country: 'india',
      currencySymbol: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      rating: 4.5,
      isActive: true,
    },
    {
      name: 'Dosa Palace',
      description: 'South Indian specialties and crispy dosas',
      cuisine: 'South Indian',
      country: 'india',
      currencySymbol: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
      rating: 4.3,
      isActive: true,
    },
    {
      name: 'Mumbai Street Food',
      description: 'Street food favorites from the heart of Mumbai',
      cuisine: 'Street Food',
      country: 'india',
      currencySymbol: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      rating: 4.7,
      isActive: true,
    },
    {
      name: 'Tandoori Nights',
      description: 'Authentic tandoor-cooked dishes and kebabs',
      cuisine: 'Mughlai',
      country: 'india',
      currencySymbol: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      rating: 4.6,
      isActive: true,
    },
    {
      name: 'Chai & Chaat',
      description: 'Traditional Indian tea house with savory snacks',
      cuisine: 'Cafe',
      country: 'india',
      currencySymbol: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      rating: 4.2,
      isActive: true,
    },
    {
      name: 'Coastal Curry',
      description: 'Fresh seafood with South Indian coastal flavors',
      cuisine: 'Seafood',
      country: 'india',
      currencySymbol: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400',
      rating: 4.4,
      isActive: true,
    },
    // America Restaurants
    {
      name: 'The Burger Joint',
      description: 'Gourmet burgers and classic American comfort food',
      cuisine: 'American',
      country: 'america',
      currencySymbol: '$',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      rating: 4.6,
      isActive: true,
    },
    {
      name: 'Pizza Paradise',
      description: 'New York style pizza with fresh ingredients',
      cuisine: 'Italian-American',
      country: 'america',
      currencySymbol: '$',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      rating: 4.4,
      isActive: true,
    },
    {
      name: 'Taco Fiesta',
      description: 'Authentic Mexican tacos and burritos',
      cuisine: 'Mexican',
      country: 'america',
      currencySymbol: '$',
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
      rating: 4.8,
      isActive: true,
    },
    {
      name: 'Sushi Supreme',
      description: 'Fresh Japanese sushi and sashimi',
      cuisine: 'Japanese',
      country: 'america',
      currencySymbol: '$',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
      rating: 4.7,
      isActive: true,
    },
    {
      name: 'BBQ Smokehouse',
      description: 'Slow-smoked meats and Southern BBQ',
      cuisine: 'BBQ',
      country: 'america',
      currencySymbol: '$',
      imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400',
      rating: 4.5,
      isActive: true,
    },
    {
      name: 'Green Bowl',
      description: 'Healthy salads and grain bowls',
      cuisine: 'Healthy',
      country: 'america',
      currencySymbol: '$',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      rating: 4.3,
      isActive: true,
    },
  ];

  const createdRestaurants = await RestaurantModel.insertMany(restaurants);
  console.log(`✅ Created ${createdRestaurants.length} restaurants`);
  
  return createdRestaurants;
}

async function seedMenuItems(restaurants: any[]) {
  console.log('🍕 Seeding menu items...');
  
  const menuItems = [];
  
  // Spice Garden (India) - North Indian
  const spiceGarden = restaurants.find(r => r.name === 'Spice Garden');
  if (spiceGarden) {
    menuItems.push(
      {
        restaurantId: spiceGarden._id.toString(),
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato sauce',
        price: 350,
        category: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        isAvailable: true,
      },
      {
        restaurantId: spiceGarden._id.toString(),
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in spicy gravy',
        price: 280,
        category: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
        isAvailable: true,
      },
      {
        restaurantId: spiceGarden._id.toString(),
        name: 'Garlic Naan',
        description: 'Fresh baked bread with garlic and butter',
        price: 60,
        category: 'Breads',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        isAvailable: true,
      },
      {
        restaurantId: spiceGarden._id.toString(),
        name: 'Biryani',
        description: 'Fragrant basmati rice with spices and meat',
        price: 320,
        category: 'Rice',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
        isAvailable: true,
      }
    );
  }
  
  // Dosa Palace (India) - South Indian
  const dosaPalace = restaurants.find(r => r.name === 'Dosa Palace');
  if (dosaPalace) {
    menuItems.push(
      {
        restaurantId: dosaPalace._id.toString(),
        name: 'Masala Dosa',
        description: 'Crispy rice crepe with spiced potato filling',
        price: 120,
        category: 'Dosas',
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400',
        isAvailable: true,
      },
      {
        restaurantId: dosaPalace._id.toString(),
        name: 'Idli Sambar',
        description: 'Steamed rice cakes with lentil soup',
        price: 80,
        category: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400',
        isAvailable: true,
      },
      {
        restaurantId: dosaPalace._id.toString(),
        name: 'Uttapam',
        description: 'Thick rice pancake with vegetables',
        price: 100,
        category: 'Dosas',
        imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
        isAvailable: true,
      },
      {
        restaurantId: dosaPalace._id.toString(),
        name: 'Filter Coffee',
        description: 'Traditional South Indian coffee',
        price: 40,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        isAvailable: true,
      }
    );
  }
  
  // Mumbai Street Food (India)
  const mumbaiStreet = restaurants.find(r => r.name === 'Mumbai Street Food');
  if (mumbaiStreet) {
    menuItems.push(
      {
        restaurantId: mumbaiStreet._id.toString(),
        name: 'Pav Bhaji',
        description: 'Spiced vegetable mash with buttered bread',
        price: 90,
        category: 'Street Food',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
        isAvailable: true,
      },
      {
        restaurantId: mumbaiStreet._id.toString(),
        name: 'Vada Pav',
        description: 'Spicy potato fritter in a bun',
        price: 50,
        category: 'Street Food',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        isAvailable: true,
      },
      {
        restaurantId: mumbaiStreet._id.toString(),
        name: 'Bhel Puri',
        description: 'Puffed rice with tangy chutneys',
        price: 60,
        category: 'Chaat',
        imageUrl: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400',
        isAvailable: true,
      }
    );
  }
  
  // The Burger Joint (America)
  const burgerJoint = restaurants.find(r => r.name === 'The Burger Joint');
  if (burgerJoint) {
    menuItems.push(
      {
        restaurantId: burgerJoint._id.toString(),
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheese, lettuce, tomato',
        price: 12.99,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
      },
      {
        restaurantId: burgerJoint._id.toString(),
        name: 'Bacon BBQ Burger',
        description: 'Beef patty with bacon and BBQ sauce',
        price: 14.99,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
        isAvailable: true,
      },
      {
        restaurantId: burgerJoint._id.toString(),
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 4.99,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        isAvailable: true,
      },
      {
        restaurantId: burgerJoint._id.toString(),
        name: 'Milkshake',
        description: 'Creamy vanilla milkshake',
        price: 5.99,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
        isAvailable: true,
      }
    );
  }
  
  // Pizza Paradise (America)
  const pizzaParadise = restaurants.find(r => r.name === 'Pizza Paradise');
  if (pizzaParadise) {
    menuItems.push(
      {
        restaurantId: pizzaParadise._id.toString(),
        name: 'Margherita Pizza',
        description: 'Classic tomato, mozzarella, and basil',
        price: 16.99,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        isAvailable: true,
      },
      {
        restaurantId: pizzaParadise._id.toString(),
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni and cheese',
        price: 18.99,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
        isAvailable: true,
      },
      {
        restaurantId: pizzaParadise._id.toString(),
        name: 'Caesar Salad',
        description: 'Romaine lettuce with Caesar dressing',
        price: 8.99,
        category: 'Salads',
        imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
        isAvailable: true,
      },
      {
        restaurantId: pizzaParadise._id.toString(),
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter',
        price: 6.99,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400',
        isAvailable: true,
      }
    );
  }
  
  // Taco Fiesta (America)
  const tacoFiesta = restaurants.find(r => r.name === 'Taco Fiesta');
  if (tacoFiesta) {
    menuItems.push(
      {
        restaurantId: tacoFiesta._id.toString(),
        name: 'Beef Tacos',
        description: 'Three soft tacos with seasoned beef',
        price: 10.99,
        category: 'Tacos',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
        isAvailable: true,
      },
      {
        restaurantId: tacoFiesta._id.toString(),
        name: 'Chicken Burrito',
        description: 'Large burrito with grilled chicken',
        price: 12.99,
        category: 'Burritos',
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
        isAvailable: true,
      },
      {
        restaurantId: tacoFiesta._id.toString(),
        name: 'Nachos Supreme',
        description: 'Tortilla chips with cheese and toppings',
        price: 9.99,
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
        isAvailable: true,
      },
      {
        restaurantId: tacoFiesta._id.toString(),
        name: 'Guacamole',
        description: 'Fresh avocado dip with chips',
        price: 6.99,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
        isAvailable: true,
      }
    );
  }

  // Tandoori Nights (India)
  const tandooriNights = restaurants.find(r => r.name === 'Tandoori Nights');
  if (tandooriNights) {
    menuItems.push(
      {
        restaurantId: tandooriNights._id.toString(),
        name: 'Tandoori Chicken',
        description: 'Marinated chicken cooked in clay oven',
        price: 380,
        category: 'Tandoor',
        imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
        isAvailable: true,
      },
      {
        restaurantId: tandooriNights._id.toString(),
        name: 'Seekh Kebab',
        description: 'Minced lamb kebabs with spices',
        price: 320,
        category: 'Kebabs',
        imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
        isAvailable: true,
      },
      {
        restaurantId: tandooriNights._id.toString(),
        name: 'Chicken Tikka',
        description: 'Boneless chicken pieces in tandoor',
        price: 280,
        category: 'Tandoor',
        imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400',
        isAvailable: true,
      }
    );
  }

  // Sushi Supreme (America)
  const sushiSupreme = restaurants.find(r => r.name === 'Sushi Supreme');
  if (sushiSupreme) {
    menuItems.push(
      {
        restaurantId: sushiSupreme._id.toString(),
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber roll',
        price: 12.99,
        category: 'Rolls',
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        isAvailable: true,
      },
      {
        restaurantId: sushiSupreme._id.toString(),
        name: 'Salmon Sashimi',
        description: 'Fresh sliced salmon',
        price: 16.99,
        category: 'Sashimi',
        imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400',
        isAvailable: true,
      },
      {
        restaurantId: sushiSupreme._id.toString(),
        name: 'Dragon Roll',
        description: 'Eel and avocado specialty roll',
        price: 18.99,
        category: 'Specialty Rolls',
        imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400',
        isAvailable: true,
      }
    );
  }

  // BBQ Smokehouse (America)
  const bbqSmokehouse = restaurants.find(r => r.name === 'BBQ Smokehouse');
  if (bbqSmokehouse) {
    menuItems.push(
      {
        restaurantId: bbqSmokehouse._id.toString(),
        name: 'Pulled Pork Sandwich',
        description: 'Slow-smoked pulled pork with coleslaw',
        price: 14.99,
        category: 'Sandwiches',
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
        isAvailable: true,
      },
      {
        restaurantId: bbqSmokehouse._id.toString(),
        name: 'Beef Brisket',
        description: '12-hour smoked beef brisket',
        price: 22.99,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        isAvailable: true,
      },
      {
        restaurantId: bbqSmokehouse._id.toString(),
        name: 'Mac & Cheese',
        description: 'Creamy Southern-style mac and cheese',
        price: 7.99,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400',
        isAvailable: true,
      }
    );
  }

  // Chai & Chaat (India)
  const chaiChaat = restaurants.find(r => r.name === 'Chai & Chaat');
  if (chaiChaat) {
    menuItems.push(
      {
        restaurantId: chaiChaat._id.toString(),
        name: 'Masala Chai',
        description: 'Traditional spiced Indian tea',
        price: 30,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
        isAvailable: true,
      },
      {
        restaurantId: chaiChaat._id.toString(),
        name: 'Samosa Chaat',
        description: 'Crispy samosas topped with chutneys and yogurt',
        price: 80,
        category: 'Chaat',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        isAvailable: true,
      },
      {
        restaurantId: chaiChaat._id.toString(),
        name: 'Aloo Tikki',
        description: 'Spiced potato patties with toppings',
        price: 70,
        category: 'Chaat',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
        isAvailable: true,
      },
      {
        restaurantId: chaiChaat._id.toString(),
        name: 'Kachori',
        description: 'Deep-fried pastry with spiced lentil filling',
        price: 50,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400',
        isAvailable: true,
      }
    );
  }

  // Coastal Curry (India)
  const coastalCurry = restaurants.find(r => r.name === 'Coastal Curry');
  if (coastalCurry) {
    menuItems.push(
      {
        restaurantId: coastalCurry._id.toString(),
        name: 'Fish Curry',
        description: 'Fresh fish in tangy coconut curry',
        price: 350,
        category: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400',
        isAvailable: true,
      },
      {
        restaurantId: coastalCurry._id.toString(),
        name: 'Prawn Masala',
        description: 'Juicy prawns in spicy masala gravy',
        price: 420,
        category: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
        isAvailable: true,
      },
      {
        restaurantId: coastalCurry._id.toString(),
        name: 'Crab Fry',
        description: 'Crispy fried crab with coastal spices',
        price: 480,
        category: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
        isAvailable: true,
      },
      {
        restaurantId: coastalCurry._id.toString(),
        name: 'Appam with Stew',
        description: 'Lacy rice pancakes with vegetable stew',
        price: 150,
        category: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
        isAvailable: true,
      }
    );
  }

  // Green Bowl (America)
  const greenBowl = restaurants.find(r => r.name === 'Green Bowl');
  if (greenBowl) {
    menuItems.push(
      {
        restaurantId: greenBowl._id.toString(),
        name: 'Quinoa Power Bowl',
        description: 'Quinoa with roasted vegetables and tahini',
        price: 13.99,
        category: 'Bowls',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        isAvailable: true,
      },
      {
        restaurantId: greenBowl._id.toString(),
        name: 'Kale Caesar Salad',
        description: 'Fresh kale with Caesar dressing and croutons',
        price: 11.99,
        category: 'Salads',
        imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
        isAvailable: true,
      },
      {
        restaurantId: greenBowl._id.toString(),
        name: 'Acai Bowl',
        description: 'Acai blend topped with granola and fresh fruits',
        price: 12.99,
        category: 'Bowls',
        imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        isAvailable: true,
      },
      {
        restaurantId: greenBowl._id.toString(),
        name: 'Green Smoothie',
        description: 'Spinach, banana, and almond milk blend',
        price: 7.99,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400',
        isAvailable: true,
      }
    );
  }

  await MenuItemModel.insertMany(menuItems);
  console.log(`✅ Created ${menuItems.length} menu items`);
}

async function seedPaymentMethods() {
  console.log('💳 Seeding payment methods...');
  
  const paymentMethods = [
    {
      name: 'Visa Credit Card',
      type: 'credit_card',
      lastFourDigits: '4242',
      isDefault: true,
    },
    {
      name: 'Mastercard Debit',
      type: 'debit_card',
      lastFourDigits: '5555',
      isDefault: false,
    },
    {
      name: 'UPI Payment',
      type: 'upi',
      lastFourDigits: '9876',
      isDefault: false,
    },
  ];

  await PaymentMethodModel.insertMany(paymentMethods);
  console.log(`✅ Created ${paymentMethods.length} payment methods`);
}

async function seed() {
  try {
    await connectDB();
    await clearDatabase();
    await seedUsers();
    const restaurants = await seedRestaurants();
    await seedMenuItems(restaurants);
    await seedPaymentMethods();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: nick@slooze.com (Admin - America)');
    console.log('   Email: marvel@slooze.com (Manager - India)');
    console.log('   Email: america@slooze.com (Manager - America)');
    console.log('   Email: thanos@slooze.com (Member - India)');
    console.log('   Email: thor@slooze.com (Member - India)');
    console.log('   Email: travis@slooze.com (Member - America)');
    console.log('   Password: password123 (for all users)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
