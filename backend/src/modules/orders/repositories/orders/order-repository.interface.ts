import { IdValueObject } from 'ddd-tool-kit';
import { OrderAggregate } from '../../domain/order.aggregate-root';

interface OrderRepository {
  save(order: OrderAggregate): Promise<void>;
  findById(id: IdValueObject): Promise<OrderAggregate | null>;
  findByCustomerId(
    customerId: IdValueObject,
    params: { page: number; size: number },
  ): Promise<{ orders: OrderAggregate[]; total: number }>;
  findBySellerProductIds(
    productIds: string[],
    page: number,
    size: number,
  ): Promise<{ orders: OrderAggregate[]; total: number }>;
}

export { OrderRepository };
