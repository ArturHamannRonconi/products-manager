import { GetProductsForSellersService } from './get-products-for-sellers.service';
import { ProductRepository } from '../../repositories/products/product-repository.interface';

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

const mockProduct = {
  id: 'p1', name: 'Product', description: 'Desc', image_url: null,
  price: 10, seller_name: 'Seller', seller_id: 's1',
  category_name: 'Electronics', category_id: 'c1', inventory_ammount: 5,
};

describe('GetProductsForSellersService', () => {
  it('should return product list with metadata', async () => {
    const productRepo = makeProductRepo({
      findForSellers: jest.fn().mockResolvedValue({ products: [mockProduct], total: 1 }),
    });
    const service = new GetProductsForSellersService(productRepo);

    const result = await service.execute({ page: 1, size: 10 });

    expect(result.isSuccess).toBe(true);
    const output = result.result as any;
    expect(output.products).toHaveLength(1);
    expect(output.total_products).toBe(1);
    expect(output.hasNextPage).toBe(false);
  });

  it('should return empty list', async () => {
    const productRepo = makeProductRepo();
    const service = new GetProductsForSellersService(productRepo);

    const result = await service.execute({ page: 1, size: 10 });

    expect(result.isSuccess).toBe(true);
    const output = result.result as any;
    expect(output.products).toHaveLength(0);
    expect(output.total_products).toBe(0);
  });

  it('should handle page greater than totalPages (returns last page)', async () => {
    const productRepo = makeProductRepo({
      findForSellers: jest.fn().mockResolvedValue({ products: [mockProduct], total: 1 }),
    });
    const service = new GetProductsForSellersService(productRepo);

    const result = await service.execute({ page: 999, size: 10 });

    expect(result.isSuccess).toBe(true);
  });
});
