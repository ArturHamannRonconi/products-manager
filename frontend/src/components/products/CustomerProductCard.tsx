'use client';

import { IProductCustomerOutput } from '@/types/product.types';
import { Button } from '@/components/ui/Button';
import { resolveImageUrl } from '@/utils/resolve-image-url';

interface CustomerProductCardProps {
  product: IProductCustomerOutput;
  onAddToCart: (product: IProductCustomerOutput) => void;
  isLocked?: boolean;
  lockReason?: string;
}

function CustomerProductCard({ product, onAddToCart, isLocked = false, lockReason }: CustomerProductCardProps) {
  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col transition-all"
      title={isLocked && lockReason ? lockReason : undefined}
    >
      {/* Blurred background content when locked */}
      {isLocked && (
        <div className="absolute inset-0 backdrop-blur-sm bg-black/50 z-10" />
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3 px-5">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 1a5 5 0 00-5 5v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 7V6a3 3 0 10-6 0v2h6zm-3 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {lockReason && (
            <p className="text-xs font-medium text-center text-white leading-snug drop-shadow">{lockReason}</p>
          )}
        </div>
      )}

      <div className="h-44 bg-white/5 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={resolveImageUrl(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-semibold text-white line-clamp-2">{product.name}</h3>

        <p className="text-lg font-bold text-indigo-400">${product.price.toFixed(2)}</p>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
          <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{product.category}</span>
          <span>by {product.seller_name}</span>
        </div>

        {!isLocked && (
          <div className="mt-auto pt-2">
            <Button onClick={() => onAddToCart(product)} className="w-full" disabled={isLocked}>
              Add to order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export { CustomerProductCard };
