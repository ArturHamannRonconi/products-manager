import { api } from './api';
import type {
  ISellerOutput,
  ICreateSellerInput,
  ISellerLoginInput,
  ISellerLoginOutput,
} from '@/types/seller.types';

const sellersService = {
  async create(
    sellers: ICreateSellerInput[],
  ): Promise<{ sellers: ISellerOutput[] }> {
    const { data } = await api.post<{ sellers: ISellerOutput[] }>('/sellers', {
      sellers,
    });
    return data;
  },

  async login(input: ISellerLoginInput): Promise<ISellerLoginOutput> {
    const { data } = await api.post<ISellerLoginOutput>('/seller/login', input);
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/seller/logout');
  },

  async getInfo(): Promise<ISellerOutput> {
    const { data } = await api.get<ISellerOutput>('/seller');
    return data;
  },
};

export { sellersService };
