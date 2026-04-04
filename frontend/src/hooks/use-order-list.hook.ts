import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '@/services/orders.service';
import { IOrderOutput } from '@/types/order.types';

interface UseOrderListParams {
  page: number;
  size: number;
}

interface UseOrderListResult {
  orders: IOrderOutput[];
  totalOrders: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useOrderList(params: UseOrderListParams): UseOrderListResult {
  const [orders, setOrders] = useState<IOrderOutput[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ordersService.getForCustomers({
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

export { useOrderList };
