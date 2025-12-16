'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import { Order } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const canCancelOrders = user ? hasPermission(user.role, 'cancel_order') : false;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders');
      const result = await response.json();

      if (!result.success) {
        setError(result.error.message || 'Failed to fetch orders');
        return;
      }

      setOrders(result.data.orders);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('An error occurred while fetching orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) {
      return;
    }

    setCancellingOrderId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error.message || 'Failed to cancel order');
        return;
      }

      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('An error occurred while cancelling the order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchOrders} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start browsing restaurants to place your first order
          </p>
          <a
            href="/restaurants"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Restaurants
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            {/* Order Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'placed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <h4 className="font-medium mb-2">Items:</h4>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{order.currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <div className="text-lg font-bold">
                Total: {order.currencySymbol}{order.total.toFixed(2)}
              </div>

              {/* Cancel Button */}
              {canCancelOrders && order.status === 'placed' && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  disabled={cancellingOrderId === order._id}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>

            {/* Cancellation Info */}
            {order.status === 'cancelled' && order.cancelReason && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Cancelled:</span> {order.cancelReason}
                </p>
                {order.cancelledAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(order.cancelledAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
