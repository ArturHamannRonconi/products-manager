'use client';

import { IProductSellerOutput } from '@/types/product.types';
import { resolveImageUrl } from '@/utils/resolve-image-url';

interface ProductTableProps {
  products: IProductSellerOutput[];
  onEdit: (product: IProductSellerOutput) => void;
  onDelete: (id: string) => void;
}

function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full divide-y divide-white/5">
        <thead className="bg-white/[0.03]">
          <tr>
            {['Image', 'Name', 'Category', 'Price', 'Stock', 'Seller', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-white/[0.03] transition-colors">
              <td className="px-4 py-3">
                {product.image_url ? (
                  <img
                    src={resolveImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-600 text-xs border border-white/5">
                    N/A
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-white">{product.name}</td>
              <td className="px-4 py-3">
                <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-1 rounded-full">
                  {product.category_name}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-indigo-400">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">{product.inventory_ammount}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{product.seller_name}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="px-3 py-1 text-xs font-medium rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="px-3 py-1 text-xs font-medium rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ProductTable };
