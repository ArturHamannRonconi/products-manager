import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { CreateBatchOrdersService } from './create-batch-orders.service';
import { OrderRepository } from '../../repositories/orders/order-repository.interface';
import { ProductRepository } from '../../../products/repositories/products/product-repository.interface';
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
    findBySellerProductIds: jest.fn().mockResolvedValue({ orders: [], total: 0 }),
    ...overrides,
  };
}

function makeProductRepo(overrides: Partial<ProductRepository> = {}): ProductRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findIdsBySellerId: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    findForSellers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    findForCustomers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    countByCategoryId: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function buildProduct(name = 'Test Product', inventoryAmount = 10): ProductAggregate {
  return ProductAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: ProductNameValueObject.init({ value: name }).result as ProductNameValueObject,
    description: ProductDescriptionValueObject.init({ value: 'Description.' }).result as ProductDescriptionValueObject,
    price: PriceValueObject.init({ value: 9.99 }).result as PriceValueObject,
    imageUrl: ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject,
    sellerId: IdValueObject.getDefault(),
    categoryId: IdValueObject.getDefault(),
    inventoryAmount: InventoryAmountValueObject.init({ value: inventoryAmount }).result as InventoryAmountValueObject,
  }).result as ProductAggregate;
}

describe('CreateBatchOrdersService', () => {
  it('should create order and deduct stock', async () => {
    const product = buildProduct('Widget', 10);
    const productId = product.id.value;

    const orderRepo = makeOrderRepo();
    const productRepo = makeProductRepo({
      findById: jest.fn().mockResolvedValue(product),
      save: jest.fn().mockResolvedValue(undefined),
    });

    const service = new CreateBatchOrdersService(orderRepo, productRepo);

    const result = await service.execute({
      customerId: IdValueObject.getDefault().value,
      orders: [{ products: [{ product_id: productId, ammount: 3 }] }],
    });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { orders: { id: string; status: string }[] };
    expect(output.orders).toHaveLength(1);
    expect(output.orders[0].status).toBe('pending');
    expect(productRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail with insufficient stock', async () => {
    const product = buildProduct('Widget', 1);
    const productId = product.id.value;

    const orderRepo = makeOrderRepo();
    const productRepo = makeProductRepo({
      findById: jest.fn().mockResolvedValue(product),
    });

    const service = new CreateBatchOrdersService(orderRepo, productRepo);

    const result = await service.execute({
      customerId: IdValueObject.getDefault().value,
      orders: [{ products: [{ product_id: productId, ammount: 5 }] }],
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Insufficient stock for product: Widget');
  });

  it('should fail when product not found', async () => {
    const orderRepo = makeOrderRepo();
    const productRepo = makeProductRepo({
      findById: jest.fn().mockResolvedValue(null),
    });

    const service = new CreateBatchOrdersService(orderRepo, productRepo);

    const result = await service.execute({
      customerId: IdValueObject.getDefault().value,
      orders: [{ products: [{ product_id: 'non-existent', ammount: 1 }] }],
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Product not found.');
  });
});
