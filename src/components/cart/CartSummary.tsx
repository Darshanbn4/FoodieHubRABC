'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

interface CartSummaryProps {
  total: number;
  canCheckout: boolean;
}

export function CartSummary({ total, canCheckout }: CartSummaryProps) {
  const router = useRouter();
  const { items, restaurantId, currencySymbol } = useCart();
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    if (!restaurantId || items.length === 0) {
      setError('Cart is empty');
      return;
    }

    // Redirect to checkout page
    router.push('/checkout');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{currencySymbol}{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Delivery Fee</span>
          <span>{currencySymbol}0.00</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {canCheckout ? (
        <button
          onClick={handleCheckout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Proceed to Checkout
        </button>
      ) : (
        <div className="space-y-2">
          <button
            disabled
            className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
          >
            Checkout Unavailable
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Only Admins and Managers can place orders
          </p>
        </div>
      )}
    </div>
  );
}
