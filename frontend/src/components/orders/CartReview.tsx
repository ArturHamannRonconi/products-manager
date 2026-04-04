'use client';

import { QuantitySelector } from '@/components/ui/QuantitySelector';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  ammount: number;
}

interface CartReviewProps {
  items: CartItem[];
  onUpdateQuantity: (product_id: string, qty: number) => void;
  onRemoveItem: (product_id: string) => void;
  totalPrice: number;
}

function CartReview({ items, onUpdateQuantity, onRemoveItem, totalPrice }: CartReviewProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">${item.price.toFixed(2)} each</p>
            </div>
            <QuantitySelector
              value={item.ammount}
              min={1}
              onChange={(qty) => onUpdateQuantity(item.product_id, qty)}
            />
            <div className="w-20 text-right">
              <p className="text-sm font-semibold text-indigo-400">
                ${(item.price * item.ammount).toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveItem(item.product_id)}
              className="text-xs text-red-500/70 hover:text-red-400 transition-colors ml-1"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-3 flex justify-between items-center bg-white/[0.02]">
        <span className="text-sm text-gray-500">Total</span>
        <p className="text-base font-bold text-white">
          ${totalPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export { CartReview };
