'use client';

import { OrderStatus } from '@/types/order.types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  processing: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  shipped:    'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  delivered:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border border-red-500/20',
};

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? 'bg-white/5 text-gray-400 border border-white/10';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

export { OrderStatusBadge };
