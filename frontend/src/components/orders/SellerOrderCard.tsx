'use client';

import { useState } from 'react';
import { IOrderForSellerItem } from '@/types/order.types';
import { resolveImageUrl } from '@/utils/resolve-image-url';

interface SellerOrderCardProps {
  order: IOrderForSellerItem;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  isUpdating: boolean;
}

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_BADGE: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  processing: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  shipped:    'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  delivered:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border border-red-500/20',
};

function SellerOrderCard({ order, onStatusChange, isUpdating }: SellerOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedId = order.id.length > 12 ? `${order.id.slice(0, 12)}…` : order.id;
  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const truncatedCustomerId =
    order.customer_id.length > 12 ? `${order.customer_id.slice(0, 12)}…` : order.customer_id;

  const badgeStyle = STATUS_BADGE[order.status] ?? 'bg-white/5 text-gray-400 border border-white/10';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors hover:border-white/15">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono text-gray-500" title={order.id}>
              #{truncatedId}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle}`}>
              {order.status}
            </span>
          </div>
          <span className="text-sm font-semibold text-white">
            ${order.total_price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>{formattedDate}</span>
          <span title={order.customer_id}>Customer: {truncatedCustomerId}</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            defaultValue=""
            disabled={isUpdating}
            onChange={(e) => { if (e.target.value) onStatusChange(order.id, e.target.value); }}
            className="text-xs rounded-lg border border-white/10 bg-white/5 text-gray-300 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="" disabled className="bg-[#111118] text-gray-500">
              Move to...
            </option>
            {ALL_STATUSES.filter((s) => s !== order.status).map((s) => (
              <option key={s} value={s} className="bg-[#111118] text-white capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          {isUpdating && (
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
        >
          {isExpanded ? 'Hide items' : 'Show items'}
          <svg
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {order.products.map((product) => (
            <div key={product.id} className="flex items-start gap-3 p-4">
              {product.image_url ? (
                <img
                  src={resolveImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5">
                  <span className="text-gray-600 text-xs">N/A</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{product.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-indigo-400">${product.price.toFixed(2)}/unit</span>
                  <span className="text-xs text-gray-500">×{product.ammount}</span>
                  <span className="text-xs font-medium text-white">
                    = ${(product.price * product.ammount).toFixed(2)}
                  </span>
                  {product.category && (
                    <span className="text-xs bg-white/5 border border-white/10 text-gray-500 px-1.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { SellerOrderCard };
