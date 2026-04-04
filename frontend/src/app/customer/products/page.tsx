'use client';

import { useState } from 'react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { CustomerProductCard } from '@/components/products/CustomerProductCard';
import { AddToCartModal } from '@/components/products/AddToCartModal';
import { Pagination } from '@/components/ui/Pagination';
import { useCustomerProductList } from '@/hooks/use-customer-product-list.hook';
import { useDebounce } from '@/hooks/use-debounce.hook';
import { useCartStore } from '@/store/cart.store';
import { IProductCustomerOutput } from '@/types/product.types';
import { SortDropdown } from '@/components/products/SortDropdown';
import { PriceRangeFilter } from '@/components/products/PriceRangeFilter';

export default function CustomerProductsPage() {
  const [page, setPage] = useState(1);
  const [size] = useState(12);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<IProductCustomerOutput | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchText, 400);
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);
  const { addItem, cartSellerId, cartSellerName } = useCartStore();

  const parsedMin = debouncedMinPrice !== '' ? parseFloat(debouncedMinPrice) : undefined;
  const parsedMax = debouncedMaxPrice !== '' ? parseFloat(debouncedMaxPrice) : undefined;
  const isPriceRangeInvalid =
    parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax;

  const { products, hasNextPage, isLoading, error } = useCustomerProductList({
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

  function handleAddToCart(product: IProductCustomerOutput) {
    setSelectedProduct(product);
  }

  function handleConfirmAddToCart(ammount: number) {
    if (!selectedProduct) return;
    const result = addItem({
      product_id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      ammount,
      seller_id: selectedProduct.seller_id,
      seller_name: selectedProduct.seller_name,
    });

    if (!result.success) {
      setCartError(
        `Finish or clear your current order (seller ${cartSellerName}) before adding products from another seller.`,
      );
    } else {
      setCartError(null);
    }

    setSelectedProduct(null);
  }

  return (
    <CustomerLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
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

        {cartError && (
          <div className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-sm text-yellow-400">
            {cartError}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const isLocked = cartSellerId !== null && product.seller_id !== cartSellerId;
              return (
                <CustomerProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isLocked={isLocked}
                  lockReason={
                    isLocked
                      ? 'Finish or clear your current order before adding products from another seller.'
                      : undefined
                  }
                />
              );
            })}
          </div>
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

      {selectedProduct && (
        <AddToCartModal
          isOpen={!!selectedProduct}
          product={selectedProduct}
          onConfirm={handleConfirmAddToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </CustomerLayout>
  );
}
