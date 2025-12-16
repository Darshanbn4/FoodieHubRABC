// Role and Permission Types
export type Role = 'admin' | 'manager' | 'member';
export type Country = 'india' | 'america';
export type Permission = 
  | 'view_restaurants'
  | 'create_order'
  | 'place_order'
  | 'cancel_order'
  | 'manage_payments';

// User Types
export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  country: Country;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

// Restaurant Types
export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string;
  country: Country;
  currencySymbol: string;
  imageUrl: string;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Menu Item Types
export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Order Types
export type OrderStatus = 'pending' | 'placed' | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  country: Country;
  currencySymbol: string;
  paymentMethodId?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem extends OrderItem {
  restaurantId: string;
  restaurantName: string;
  currencySymbol: string;
}

// Payment Method Types
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'upi';

export interface PaymentMethod {
  _id: string;
  name: string;
  type: PaymentMethodType;
  lastFourDigits: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  country: Country;
}
