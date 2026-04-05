import { DeleteProductService } from './delete-product.service';
import { ProductRepository } from '../../repositories/products/product-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { ProductAggregate } from '../../domain/product.aggregate-root';
import { ProductNameValueObject } from '../../domain/value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from '../../domain/value-objects/product-description/product-description.value-object';
import { PriceValueObject } from '../../domain/value-objects/price/price.value-object';
import { ImageUrlValueObject } from '../../domain/value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from '../../domain/value-objects/inventory-amount/inventory-amount.value-object';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';

function buildProduct(): ProductAggregate {
  return ProductAggregate.init({
    id: IdValueObject.init({ value: 'product-1' }).result as IdValueObject,
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: ProductNameValueObject.init({ value: 'Test Product' }).result as ProductNameValueObject,
    description: ProductDescriptionValueObject.init({ value: 'Desc.' }).result as ProductDescriptionValueObject,
    price: PriceValueObject.init({ value: 10 }).result as PriceValueObject,
    imageUrl: ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject,
    sellerId: IdValueObject.getDefault(),
    categoryId: IdValueObject.init({ value: 'cat-1' }).result as IdValueObject,
    inventoryAmount: InventoryAmountValueObject.init({ value: 5 }).result as InventoryAmountValueObject,
  }).result as ProductAggregate;
}

function makeProductRepo(overrides: Partial<ProductRepository> = {}): ProductRepository {
  const product = buildProduct();
  return {
    findById: jest.fn().mockResolvedValue(product),
    findIdsBySellerId: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    findForSellers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    findForCustomers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    countByCategoryId: jest.fn().mockResolvedValue(1),
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

describe('DeleteProductService', () => {
  it('should delete a product', async () => {
    const productRepo = makeProductRepo();
    const categoryRepo = makeCategoryRepo();
    const service = new DeleteProductService(productRepo, categoryRepo);

    const result = await service.execute({ productId: 'product-1' });

    expect(result.isSuccess).toBe(true);
    expect(productRepo.delete).toHaveBeenCalledTimes(1);
    expect(categoryRepo.delete).not.toHaveBeenCalled();
  });

  it('should delete product and orphan category', async () => {
    const productRepo = makeProductRepo({ countByCategoryId: jest.fn().mockResolvedValue(0) });
    const categoryRepo = makeCategoryRepo();
    const service = new DeleteProductService(productRepo, categoryRepo);

    const result = await service.execute({ productId: 'product-1' });

    expect(result.isSuccess).toBe(true);
    expect(productRepo.delete).toHaveBeenCalledTimes(1);
    expect(categoryRepo.delete).toHaveBeenCalledTimes(1);
  });

  it('should fail when product not found', async () => {
    const productRepo = makeProductRepo({ findById: jest.fn().mockResolvedValue(null) });
    const categoryRepo = makeCategoryRepo();
    const service = new DeleteProductService(productRepo, categoryRepo);

    const result = await service.execute({ productId: 'non-existent' });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Product not found.');
  });
});
