'use client';

import { useState } from 'react';
import { IOrderOutput } from '@/types/order.types';
import { resolveImageUrl } from '@/utils/resolve-image-url';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: IOrderOutput;
}

function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedId = order.id.length > 12 ? `${order.id.slice(0, 12)}…` : order.id;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors hover:border-white/15">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500" title={order.id}>
            #{truncatedId}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">
            ${order.total_price.toFixed(2)}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
                <p className="text-xs text-gray-500 truncate">{product.description}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-indigo-400">${product.price.toFixed(2)}</span>
                  {product.seller_name && (
                    <span className="text-xs text-gray-500">by {product.seller_name}</span>
                  )}
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

export { OrderCard };
