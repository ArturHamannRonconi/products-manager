import { api } from './api';
import type {
  ICustomerOutput,
  ICreateCustomerInput,
  ICustomerLoginInput,
  ICustomerLoginOutput,
} from '@/types/customer.types';

const customersService = {
  async create(
    customers: ICreateCustomerInput[],
  ): Promise<{ customers: ICustomerOutput[] }> {
    const { data } = await api.post<{ customers: ICustomerOutput[] }>('/customers', {
      customers,
    });
    return data;
  },

  async login(input: ICustomerLoginInput): Promise<ICustomerLoginOutput> {
    const { data } = await api.post<ICustomerLoginOutput>('/customer/login', input);
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/customer/logout');
  },

  async getInfo(): Promise<ICustomerOutput> {
    const { data } = await api.get<ICustomerOutput>('/customer');
    return data;
  },
};

export { customersService };
