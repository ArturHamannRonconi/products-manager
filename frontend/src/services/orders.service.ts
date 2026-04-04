import { api } from './api';
import {
  ICreateOrderInput,
  IOrderCreatedOutput,
  IOrderListResponse,
  IListOrdersForSellerResponse,
  IOrderStatusUpdateResponse,
} from '@/types/order.types';

const ordersService = {
  async create(orders: ICreateOrderInput[]): Promise<{ orders: IOrderCreatedOutput[] }> {
    const { data } = await api.post<{ orders: IOrderCreatedOutput[] }>('/orders', { orders });
    return data;
  },

  async getForCustomers(params: {
    page: number;
    size: number;
  }): Promise<IOrderListResponse> {
    const { data } = await api.get<IOrderListResponse>('/orders/for-customers', { params });
    return data;
  },

  async getForSellers(params: {
    page: number;
    size: number;
  }): Promise<IListOrdersForSellerResponse> {
    const { data } = await api.get<IListOrdersForSellerResponse>('/orders/for-sellers', { params });
    return data;
  },

  async updateStatus(orderId: string, status: string): Promise<IOrderStatusUpdateResponse> {
    const { data } = await api.patch<IOrderStatusUpdateResponse>(`/orders/${orderId}/status`, { status });
    return data;
  },
};

export { ordersService };
