'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { OrderCard } from '@/components/orders/OrderCard';
import { Pagination } from '@/components/ui/Pagination';
import { useOrderList } from '@/hooks/use-order-list.hook';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const { orders, hasNextPage, isLoading, error } = useOrderList({ page, size });

  return (
    <CustomerLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <button
            onClick={() => router.push('/customer/orders/new')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
          >
            View Cart
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-gray-500">You don&apos;t have any orders yet.</p>
            <button
              onClick={() => router.push('/customer/products')}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Explore products
            </button>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="flex justify-center">
            <Pagination
              currentPage={page}
              hasNextPage={hasNextPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
