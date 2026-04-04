import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { UpdateOrderStatusService } from './update-order-status.service';
import { OrderRepository } from '../../repositories/orders/order-repository.interface';
import { ProductRepository } from '../../../products/repositories/products/product-repository.interface';
import { SellerRepository } from '../../../sellers/repositories/sellers/seller-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { OrderAggregate } from '../../domain/order.aggregate-root';
import { OrderStatusValueObject } from '../../domain/value-objects/order-status/order-status.value-object';
import { OrderItemEntity } from '../../domain/entities/order-item/order-item.entity';
import { AmountValueObject } from '../../domain/value-objects/amount/amount.value-object';

const SELLER_ID = 'seller-abc';

function makeOrderRepo(overrides: Partial<OrderRepository> = {}): OrderRepository {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn().mockResolvedValue(null),
    findByCustomerId: jest.fn().mockResolvedValue({ orders: [], total: 0 }),
    ...overrides,
  };
}

function makeProductRepoWithSeller(sellerId = SELLER_ID): ProductRepository {
  const productId = IdValueObject.getDefault();
  const fakeProduct = {
    id: productId,
    sellerId: IdValueObject.init({ value: sellerId }).result,
    categoryId: IdValueObject.getDefault(),
    name: { value: 'Product' },
    description: { value: 'Desc' },
    price: { value: 10 },
    imageUrl: { value: null },
    inventoryAmount: { value: 5 },
  };
  return {
    findById: jest.fn().mockResolvedValue(fakeProduct),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    findForSellers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    findForCustomers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    countByCategoryId: jest.fn().mockResolvedValue(0),
  };
}

function makeProductRepoWithNoMatch(): ProductRepository {
  return makeProductRepoWithSeller('other-seller');
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

function buildOrder(status = 'pending'): OrderAggregate {
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
    status: OrderStatusValueObject.init({ value: status }).result as OrderStatusValueObject,
    customerId: IdValueObject.getDefault(),
    products: [item],
  }).result as OrderAggregate;
}

describe('UpdateOrderStatusService', () => {
  it('should update order from pending to processing', async () => {
    const order = buildOrder('pending');

    const orderRepo = makeOrderRepo({ findById: jest.fn().mockResolvedValue(order) });
    const service = new UpdateOrderStatusService(
      orderRepo,
      makeProductRepoWithSeller(),
      makeSellerRepo(),
      makeCategoryRepo(),
    );
    const result = await service.execute({
      orderId: order.id.value,
      status: 'processing',
      sellerId: SELLER_ID,
    });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { status: string };
    expect(output.status).toBe('processing');
    expect(orderRepo.save).toHaveBeenCalled();
  });

  it('should update order to cancelled from any status', async () => {
    for (const status of ['pending', 'processing', 'shipped', 'delivered']) {
      const order = buildOrder(status);
      const orderRepo = makeOrderRepo({ findById: jest.fn().mockResolvedValue(order) });
      const service = new UpdateOrderStatusService(
        orderRepo,
        makeProductRepoWithSeller(),
        makeSellerRepo(),
        makeCategoryRepo(),
      );
      const result = await service.execute({
        orderId: order.id.value,
        status: 'cancelled',
        sellerId: SELLER_ID,
      });
      expect(result.isSuccess).toBe(true);
    }
  });

  it('should allow any valid status transition (e.g. pending → delivered)', async () => {
    const order = buildOrder('pending');
    const orderRepo = makeOrderRepo({ findById: jest.fn().mockResolvedValue(order) });
    const service = new UpdateOrderStatusService(
      orderRepo,
      makeProductRepoWithSeller(),
      makeSellerRepo(),
      makeCategoryRepo(),
    );
    const result = await service.execute({
      orderId: order.id.value,
      status: 'delivered',
      sellerId: SELLER_ID,
    });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { status: string };
    expect(output.status).toBe('delivered');
  });

  it('should fail with 403 when seller does not own any product in the order', async () => {
    const order = buildOrder('pending');
    const orderRepo = makeOrderRepo({ findById: jest.fn().mockResolvedValue(order) });
    const service = new UpdateOrderStatusService(
      orderRepo,
      makeProductRepoWithNoMatch(),
      makeSellerRepo(),
      makeCategoryRepo(),
    );
    const result = await service.execute({
      orderId: order.id.value,
      status: 'processing',
      sellerId: SELLER_ID,
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string; statusCode: number };
    expect(error.message).toBe('You do not have permission to update this order.');
    expect(error.statusCode).toBe(403);
  });

  it('should fail when order not found', async () => {
    const orderRepo = makeOrderRepo({ findById: jest.fn().mockResolvedValue(null) });
    const service = new UpdateOrderStatusService(
      orderRepo,
      makeProductRepoWithSeller(),
      makeSellerRepo(),
      makeCategoryRepo(),
    );
    const result = await service.execute({
      orderId: 'non-existent',
      status: 'processing',
      sellerId: SELLER_ID,
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Order not found.');
  });
});
