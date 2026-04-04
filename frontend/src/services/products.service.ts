import { api } from './api';
import {
  IProductSellerOutput,
  IProductCustomerOutput,
  ICreateProductInput,
  IProductCreatedOutput,
  IProductListResponse,
} from '@/types/product.types';

const productsService = {
  async getForSellers(params: {
    size: number;
    page: number;
    searchByText?: string;
    sort_by?: string;
    order?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<IProductListResponse<IProductSellerOutput>> {
    const { data } = await api.get<IProductListResponse<IProductSellerOutput>>(
      '/products/for-sellers',
      { params },
    );
    return data;
  },

  async getForCustomers(params: {
    size: number;
    page: number;
    searchByText?: string;
    sort_by?: string;
    order?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<IProductListResponse<IProductCustomerOutput>> {
    const { data } = await api.get<IProductListResponse<IProductCustomerOutput>>(
      '/products/for-customers',
      { params },
    );
    return data;
  },

  async create(products: ICreateProductInput[]): Promise<{ products: IProductCreatedOutput[] }> {
    const { data } = await api.post<{ products: IProductCreatedOutput[] }>('/products', {
      products,
    });
    return data;
  },

  async update(id: string, input: Partial<ICreateProductInput>): Promise<IProductSellerOutput> {
    const { data } = await api.put<IProductSellerOutput>(`/product/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/product/${id}`);
  },

  async uploadImage(id: string, file: File): Promise<IProductSellerOutput> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<IProductSellerOutput>(`/product/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export { productsService };
