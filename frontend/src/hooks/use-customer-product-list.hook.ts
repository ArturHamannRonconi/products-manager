import { useState, useEffect, useCallback } from 'react';
import { productsService } from '@/services/products.service';
import { IProductCustomerOutput } from '@/types/product.types';

interface UseCustomerProductListParams {
  page: number;
  size: number;
  searchByText?: string;
  sortBy?: string;
  order?: string;
  minPrice?: number;
  maxPrice?: number;
  skip?: boolean;
}

interface UseCustomerProductListResult {
  products: IProductCustomerOutput[];
  totalProducts: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useCustomerProductList(params: UseCustomerProductListParams): UseCustomerProductListResult {
  const [products, setProducts] = useState<IProductCustomerOutput[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (params.skip) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await productsService.getForCustomers({
        page: params.page,
        size: params.size,
        searchByText: params.searchByText,
        sort_by: params.sortBy,
        order: params.order,
        min_price: params.minPrice,
        max_price: params.maxPrice,
      });
      setProducts(result.products);
      setTotalProducts(result.total_products);
      setHasNextPage(result.hasNextPage);
    } catch {
      setError('Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.size, params.searchByText, params.sortBy, params.order, params.minPrice, params.maxPrice, params.skip]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, totalProducts, hasNextPage, isLoading, error, refetch: fetch };
}

export { useCustomerProductList };
