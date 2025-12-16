'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { hasPermission } from '@/lib/rbac';

interface PaymentMethod {
  _id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer';
  isActive: boolean;
}

export default function CheckoutPage() {
  const { items, total, restaurantId, restaurantName, currencySymbol, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPlaceOrder = user && hasPermission(user.role, 'place_order');

  // Redirect if cart is empty or user can't place orders
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    if (!canPlaceOrder) {
      router.push('/cart');
      return;
    }
  }, [items.length, canPlaceOrder, router]);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payments');
        const result = await response.json();
        console.log('Payment methods response:', result);
        if (result.success) {
          setPaymentMethods(result.data.filter((pm: PaymentMethod) => pm.isActive));
          // Auto-select first payment method
          if (result.data.length > 0) {
            setSelectedPaymentMethod(result.data[0]._id);
          }
        } else {
          console.error('Failed to fetch payment methods:', result.error);
          setError(result.error?.message || 'Failed to load payment methods');
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setError('Failed to load payment methods');
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !restaurantId || items.length === 0) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order
      const orderData = {
        restaurantId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        paymentMethodId: selectedPaymentMethod,
        total,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || 'Failed to place order');
        return;
      }

      // Clear cart and redirect to success page
      clearCart();
      router.push(`/orders?success=true&orderId=${result.data._id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 || !canPlaceOrder) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your order from {restaurantName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.menuItemId}-${item.restaurantId}`} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity} × {currencySymbol}{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            {error ? (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            ) : paymentMethods.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Loading payment methods...</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method._id}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method._id}
                      checked={selectedPaymentMethod === method._id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {method.type.replace('_', ' ')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Fee</span>
                <span>{currencySymbol}0.00</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
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

            <div className="space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedPaymentMethod}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isProcessing ? 'Processing Payment...' : `Pay ${currencySymbol}${total.toFixed(2)}`}
              </button>
              
              <button
                onClick={() => router.push('/cart')}
                disabled={isProcessing}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}