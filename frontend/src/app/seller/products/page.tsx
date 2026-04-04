'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { ProductTable } from '@/components/products/ProductTable';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDeleteModal } from '@/components/products/ConfirmDeleteModal';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { useProductList } from '@/hooks/use-product-list.hook';
import { useDebounce } from '@/hooks/use-debounce.hook';
import { useProductsStore } from '@/store/products.store';
import { productsService } from '@/services/products.service';
import { IProductSellerOutput } from '@/types/product.types';
import { SortDropdown } from '@/components/products/SortDropdown';
import { PriceRangeFilter } from '@/components/products/PriceRangeFilter';

export default function SellerProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchText, 400);
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);
  const { setCurrentProduct } = useProductsStore();

  const parsedMin = debouncedMinPrice !== '' ? parseFloat(debouncedMinPrice) : undefined;
  const parsedMax = debouncedMaxPrice !== '' ? parseFloat(debouncedMaxPrice) : undefined;
  const isPriceRangeInvalid =
    parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax;

  const { products, hasNextPage, isLoading, error, refetch } = useProductList({
    page,
    size,
    searchByText: debouncedSearch || undefined,
    sortBy,
    order,
    minPrice: !isPriceRangeInvalid && parsedMin !== undefined && parsedMin >= 0 ? parsedMin : undefined,
    maxPrice: !isPriceRangeInvalid && parsedMax !== undefined && parsedMax >= 0 ? parsedMax : undefined,
    skip: isPriceRangeInvalid,
  });

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(e.target.value);
    setPage(1);
  }

  function handleSortChange(newSortBy: string, newOrder: string) {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);
  }

  function handleMinPriceChange(v: string) {
    setMinPrice(v);
    setPage(1);
  }

  function handleMaxPriceChange(v: string) {
    setMaxPrice(v);
    setPage(1);
  }

  function handleEdit(product: IProductSellerOutput) {
    setCurrentProduct(product);
    router.push(`/seller/products/${product.id}/edit`);
  }

  function handleDeleteRequest(id: string) {
    setDeleteTargetId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    try {
      await productsService.remove(deleteTargetId);
      setDeleteTargetId(null);
      refetch();
    } catch (err: any) {
      setDeleteTargetId(null);
      if (err?.response?.status === 403) {
        setToastMessage('Invalid session. Please log in again.');
      } else {
        setToastMessage('Failed to delete product.');
      }
    }
  }

  return (
    <SellerLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <input
              type="text"
              placeholder="Search products..."
              value={searchText}
              onChange={handleSearchChange}
              className="flex-1 max-w-md px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <SortDropdown
              value={`${sortBy}_${order}`}
              onChange={handleSortChange}
            />
            <PriceRangeFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinPriceChange}
              onMaxChange={handleMaxPriceChange}
            />
          </div>
          <Button onClick={() => router.push('/seller/products/new')}>
            + New Product
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {!isLoading && !error && (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}

        {!isLoading && (
          <div className="flex justify-center">
            <Pagination
              currentPage={page}
              hasNextPage={hasNextPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTargetId}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTargetId(null)}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </SellerLayout>
  );
}
