'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { CartReview } from '@/components/orders/CartReview';
import { Toast } from '@/components/ui/Toast';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { ordersService } from '@/services/orders.service';

export default function NewOrderPage() {
  const router = useRouter();
  const cart = useCartStore();
  const { userId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handlePlaceOrder() {
    setIsLoading(true);
    setToast(null);

    try {
      await ordersService.create([
        {
          customer_id: userId ?? '',
          products: cart.items.map((i) => ({ product_id: i.product_id, ammount: i.ammount })),
        },
      ]);
      cart.clear();
      router.push('/customer/orders');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        setToast(err?.response?.data?.message ?? 'Invalid order data.');
      } else if (status === 403) {
        setToast('Invalid session. Please log in again.');
      } else {
        setToast('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <CustomerLayout>
        <div className="p-6 text-center py-16 space-y-4">
          <p className="text-gray-500">Your cart is empty.</p>
          <button
            onClick={() => router.push('/customer/products')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Explore products
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Review your order</h1>

        <CartReview
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          totalPrice={cart.totalPrice()}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => cart.clear()}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            Clear cart
          </button>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            )}
            Place Order
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </CustomerLayout>
  );
}
