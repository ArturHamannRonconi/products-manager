import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { GetOrdersForCustomersService } from './get-orders-for-customers.service';
import { OrderRepository } from '../../repositories/orders/order-repository.interface';
import { ProductRepository } from '../../../products/repositories/products/product-repository.interface';
import { SellerRepository } from '../../../sellers/repositories/sellers/seller-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { OrderAggregate } from '../../domain/order.aggregate-root';
import { OrderStatusValueObject } from '../../domain/value-objects/order-status/order-status.value-object';
import { OrderItemEntity } from '../../domain/entities/order-item/order-item.entity';
import { AmountValueObject } from '../../domain/value-objects/amount/amount.value-object';
import { ProductAggregate } from '../../../products/domain/product.aggregate-root';
import { ProductNameValueObject } from '../../../products/domain/value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from '../../../products/domain/value-objects/product-description/product-description.value-object';
import { PriceValueObject } from '../../../products/domain/value-objects/price/price.value-object';
import { ImageUrlValueObject } from '../../../products/domain/value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from '../../../products/domain/value-objects/inventory-amount/inventory-amount.value-object';

function makeOrderRepo(overrides: Partial<OrderRepository> = {}): OrderRepository {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn().mockResolvedValue(null),
    findByCustomerId: jest.fn().mockResolvedValue({ orders: [], total: 0 }),
    ...overrides,
  };
}

function makeProductRepo(overrides: Partial<ProductRepository> = {}): ProductRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    findForSellers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    findForCustomers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    countByCategoryId: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function makeSellerRepo(overrides: Partial<SellerRepository> = {}): SellerRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    findByRefreshToken: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeCategoryRepo(overrides: Partial<CategoryRepository> = {}): CategoryRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByName: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildOrder(): OrderAggregate {
  const item = OrderItemEntity.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    productId: IdValueObject.getDefault(),
    ammount: AmountValueObject.init({ value: 2 }).result as AmountValueObject,
  }).result as OrderItemEntity;

  return OrderAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    status: OrderStatusValueObject.init({ value: 'pending' }).result as OrderStatusValueObject,
    customerId: IdValueObject.getDefault(),
    products: [item],
  }).result as OrderAggregate;
}

function buildProduct(): ProductAggregate {
  return ProductAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: ProductNameValueObject.init({ value: 'Widget' }).result as ProductNameValueObject,
    description: ProductDescriptionValueObject.init({ value: 'Desc.' }).result as ProductDescriptionValueObject,
    price: PriceValueObject.init({ value: 10 }).result as PriceValueObject,
    imageUrl: ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject,
    sellerId: IdValueObject.getDefault(),
    categoryId: IdValueObject.getDefault(),
    inventoryAmount: InventoryAmountValueObject.init({ value: 5 }).result as InventoryAmountValueObject,
  }).result as ProductAggregate;
}

describe('GetOrdersForCustomersService', () => {
  it('should return enriched orders', async () => {
    const order = buildOrder();
    const product = buildProduct();

    const orderRepo = makeOrderRepo({
      findByCustomerId: jest.fn().mockResolvedValue({ orders: [order], total: 1 }),
    });
    const productRepo = makeProductRepo({
      findById: jest.fn().mockResolvedValue(product),
    });

    const service = new GetOrdersForCustomersService(orderRepo, productRepo, makeSellerRepo(), makeCategoryRepo());
    const result = await service.execute({ customerId: IdValueObject.getDefault().value, page: 1, size: 10 });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { orders: { total_price: number }[]; total_orders: number };
    expect(output.orders).toHaveLength(1);
    expect(output.orders[0].total_price).toBe(20);
    expect(output.total_orders).toBe(1);
  });

  it('should return empty list when no orders', async () => {
    const orderRepo = makeOrderRepo();
    const service = new GetOrdersForCustomersService(orderRepo, makeProductRepo(), makeSellerRepo(), makeCategoryRepo());
    const result = await service.execute({ customerId: IdValueObject.getDefault().value, page: 1, size: 10 });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { orders: any[]; total_orders: number };
    expect(output.orders).toHaveLength(0);
    expect(output.total_orders).toBe(0);
  });

  it('should compute pagination fields', async () => {
    const orders = [buildOrder(), buildOrder()];
    const orderRepo = makeOrderRepo({
      findByCustomerId: jest.fn().mockResolvedValue({ orders, total: 5 }),
    });

    const service = new GetOrdersForCustomersService(orderRepo, makeProductRepo(), makeSellerRepo(), makeCategoryRepo());
    const result = await service.execute({ customerId: IdValueObject.getDefault().value, page: 1, size: 2 });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { hasNextPage: boolean; remaining_orders: number };
    expect(output.hasNextPage).toBe(true);
    expect(output.remaining_orders).toBe(3);
  });
});
