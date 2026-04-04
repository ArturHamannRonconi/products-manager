'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { SellerOrderCard } from '@/components/orders/SellerOrderCard';
import { Pagination } from '@/components/ui/Pagination';
import { Toast } from '@/components/ui/Toast';
import { useSellerOrdersList } from '@/hooks/use-seller-orders-list.hook';
import { ordersService } from '@/services/orders.service';
import { IOrderForSellerItem } from '@/types/order.types';

export default function SellerOrdersPage() {
  const router = useRouter();
  const { accessToken, userType } = useAuthStore();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [localOrders, setLocalOrders] = useState<IOrderForSellerItem[] | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || userType !== 'seller') {
      router.replace('/seller/login');
    }
  }, [accessToken, userType, router]);

  const { orders, hasNextPage, isLoading, error } = useSellerOrdersList({ page, size });

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const displayedOrders = localOrders ?? orders;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await ordersService.updateStatus(orderId, newStatus);
      setLocalOrders((prev) =>
        prev ? prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)) : prev,
      );
    } catch (err: any) {
      const code = err?.response?.status ?? null;
      if (code === 403) {
        setToast("You don't have permission to update this order.");
      } else if (code === 400) {
        setToast('Invalid status transition.');
      } else {
        setToast('Failed to update order status.');
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!accessToken || userType !== 'seller') return null;

  return (
    <SellerLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Orders</h1>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!isLoading && !error && displayedOrders.length === 0 && (
          <p className="text-sm text-gray-500 py-12 text-center">No orders yet.</p>
        )}

        {!isLoading && !error && displayedOrders.length > 0 && (
          <div className="space-y-3">
            {displayedOrders.map((order) => (
              <SellerOrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                isUpdating={updatingOrderId === order.id}
              />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="flex justify-center">
            <Pagination currentPage={page} hasNextPage={hasNextPage} onPageChange={setPage} />
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </SellerLayout>
  );
}
