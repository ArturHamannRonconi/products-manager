import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '@/services/orders.service';
import { IOrderForSellerItem } from '@/types/order.types';

interface UseSellerOrdersListParams {
  page: number;
  size: number;
}

interface UseSellerOrdersListResult {
  orders: IOrderForSellerItem[];
  totalOrders: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useSellerOrdersList(params: UseSellerOrdersListParams): UseSellerOrdersListResult {
  const [orders, setOrders] = useState<IOrderForSellerItem[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ordersService.getForSellers({
        page: params.page,
        size: params.size,
      });
      setOrders(result.orders);
      setTotalOrders(result.total_orders);
      setHasNextPage(result.hasNextPage);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { orders, totalOrders, hasNextPage, isLoading, error, refetch: fetch };
}

export { useSellerOrdersList };
