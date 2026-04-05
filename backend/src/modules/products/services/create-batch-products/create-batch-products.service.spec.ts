import { CreateBatchProductsService } from './create-batch-products.service';
import { ProductRepository } from '../../repositories/products/product-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { CategoryAggregate } from '../../../categories/domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../../categories/domain/value-objects/category-name/category-name.value-object';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';

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

function makeCategoryRepo(overrides: Partial<CategoryRepository> = {}): CategoryRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByName: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildCategory(name = 'electronics'): CategoryAggregate {
  return CategoryAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: CategoryNameValueObject.init({ value: name }).result as CategoryNameValueObject,
  }).result as CategoryAggregate;
}

describe('CreateBatchProductsService', () => {
  it('should create product and auto-create new category', async () => {
    const productRepo = makeProductRepo();
    const categoryRepo = makeCategoryRepo();
    const service = new CreateBatchProductsService(productRepo, categoryRepo);

    const result = await service.execute({
      sellerId: IdValueObject.getDefault().value,
      products: [
        {
          name: 'Test Product',
          description: 'A test description.',
          category: 'Electronics',
          price: 19.99,
          inventory_ammount: 10,
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
    expect(categoryRepo.save).toHaveBeenCalledTimes(1);
    expect(productRepo.save).toHaveBeenCalledTimes(1);
    const output = result.result as { products: { id: string }[] };
    expect(output.products).toHaveLength(1);
  });

  it('should reuse existing category when found', async () => {
    const existingCategory = buildCategory('electronics');
    const productRepo = makeProductRepo();
    const categoryRepo = makeCategoryRepo({
      findByName: jest.fn().mockResolvedValue(existingCategory),
    });
    const service = new CreateBatchProductsService(productRepo, categoryRepo);

    const result = await service.execute({
      sellerId: IdValueObject.getDefault().value,
      products: [
        {
          name: 'Another Product',
          description: 'Description here.',
          category: 'Electronics',
          price: 9.99,
          inventory_ammount: 5,
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
    expect(categoryRepo.save).not.toHaveBeenCalled();
    expect(productRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail with invalid product name', async () => {
    const productRepo = makeProductRepo();
    const categoryRepo = makeCategoryRepo();
    const service = new CreateBatchProductsService(productRepo, categoryRepo);

    const result = await service.execute({
      sellerId: IdValueObject.getDefault().value,
      products: [
        {
          name: '',
          description: 'A description.',
          category: 'Electronics',
          price: 9.99,
          inventory_ammount: 5,
        },
      ],
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Product name must be between 1 and 200 characters.');
  });
});
