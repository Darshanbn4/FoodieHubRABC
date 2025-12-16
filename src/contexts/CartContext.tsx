'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  currencySymbol: string;
  total: number;
  addItem: (item: CartItem) => Promise<boolean>;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'food-ordering-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setItems(parsed.items || []);
        setRestaurantId(parsed.restaurantId || null);
        setRestaurantName(parsed.restaurantName || null);
        setCurrencySymbol(parsed.currencySymbol || '$');
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        items,
        restaurantId,
        restaurantName,
        currencySymbol,
      })
    );
  }, [items, restaurantId, restaurantName, currencySymbol, mounted]);

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addItem = async (item: CartItem): Promise<boolean> => {
    // Check if cart has items from a different restaurant
    if (restaurantId && restaurantId !== item.restaurantId) {
      // Return false to indicate restaurant mismatch
      // The calling component should handle the confirmation dialog
      return false;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.menuItemId === item.menuItemId
      );

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });

    // Set restaurant info if this is the first item
    if (!restaurantId) {
      setRestaurantId(item.restaurantId);
      setRestaurantName(item.restaurantName);
      setCurrencySymbol(item.currencySymbol);
    }

    return true;
  };

  // Update item quantity
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (menuItemId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.menuItemId !== menuItemId);
      
      // Clear restaurant info if cart becomes empty
      if (newItems.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      
      return newItems;
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setCurrencySymbol('$');
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        currencySymbol,
        total,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
