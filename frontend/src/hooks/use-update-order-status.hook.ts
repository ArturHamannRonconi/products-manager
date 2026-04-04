import { useState } from 'react';
import { ordersService } from '@/services/orders.service';

interface UseUpdateOrderStatusResult {
  updateStatus: (orderId: string, status: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  errorCode: number | null;
}

function useUpdateOrderStatus(): UseUpdateOrderStatusResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const updateStatus = async (orderId: string, status: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      await ordersService.updateStatus(orderId, status);
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.error_message ?? 'Failed to update order status.';
      const code = err?.response?.status ?? null;
      setError(message);
      setErrorCode(code);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading, error, errorCode };
}

export { useUpdateOrderStatus };
