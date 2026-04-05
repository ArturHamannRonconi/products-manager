import { GetProductsForCustomersService } from './get-products-for-customers.service';
import { ProductRepository } from '../../repositories/products/product-repository.interface';

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

const mockCustomerProduct = {
  id: 'p1', name: 'Product', image_url: null,
  description: 'Desc', price: 10, category: 'Electronics', seller_name: 'Seller',
  seller_id: 's1',
};

describe('GetProductsForCustomersService', () => {
  it('should return customer product list with metadata', async () => {
    const productRepo = makeProductRepo({
      findForCustomers: jest.fn().mockResolvedValue({ products: [mockCustomerProduct], total: 1 }),
    });
    const service = new GetProductsForCustomersService(productRepo);

    const result = await service.execute({ page: 1, size: 10, sortBy: 'name', order: 'asc' });

    expect(result.isSuccess).toBe(true);
    const output = result.result as any;
    expect(output.products).toHaveLength(1);
    expect(output.total_products).toBe(1);
    expect(output.hasNextPage).toBe(false);
  });

  it('should return empty list', async () => {
    const productRepo = makeProductRepo();
    const service = new GetProductsForCustomersService(productRepo);

    const result = await service.execute({ page: 1, size: 10, sortBy: 'name', order: 'asc' });

    expect(result.isSuccess).toBe(true);
    const output = result.result as any;
    expect(output.products).toHaveLength(0);
  });

  it('should handle page greater than totalPages', async () => {
    const productRepo = makeProductRepo({
      findForCustomers: jest.fn().mockResolvedValue({ products: [mockCustomerProduct], total: 1 }),
    });
    const service = new GetProductsForCustomersService(productRepo);

    const result = await service.execute({ page: 999, size: 10, sortBy: 'name', order: 'asc' });

    expect(result.isSuccess).toBe(true);
  });
});
