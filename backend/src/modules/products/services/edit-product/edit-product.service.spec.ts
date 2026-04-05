import { EditProductService } from './edit-product.service';
import { ProductRepository } from '../../repositories/products/product-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { SellerRepository } from '../../../sellers/repositories/sellers/seller-repository.interface';
import { ProductAggregate } from '../../domain/product.aggregate-root';
import { ProductNameValueObject } from '../../domain/value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from '../../domain/value-objects/product-description/product-description.value-object';
import { PriceValueObject } from '../../domain/value-objects/price/price.value-object';
import { ImageUrlValueObject } from '../../domain/value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from '../../domain/value-objects/inventory-amount/inventory-amount.value-object';
import { CategoryAggregate } from '../../../categories/domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../../categories/domain/value-objects/category-name/category-name.value-object';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';

const PRODUCT_ID   = 'product-id------';  // 16 chars
const CATEGORY_ID  = 'category-id-----';  // 16 chars
const CATEGORY2_ID = 'category-id2----';  // 16 chars

function buildProduct(categoryId = CATEGORY_ID): ProductAggregate {
  return ProductAggregate.init({
    id: IdValueObject.init({ value: PRODUCT_ID }).result as IdValueObject,
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: ProductNameValueObject.init({ value: 'Test Product' }).result as ProductNameValueObject,
    description: ProductDescriptionValueObject.init({ value: 'Original description.' }).result as ProductDescriptionValueObject,
    price: PriceValueObject.init({ value: 10 }).result as PriceValueObject,
    imageUrl: ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject,
    sellerId: IdValueObject.getDefault(),
    categoryId: IdValueObject.init({ value: categoryId }).result as IdValueObject,
    inventoryAmount: InventoryAmountValueObject.init({ value: 5 }).result as InventoryAmountValueObject,
  }).result as ProductAggregate;
}

function buildCategory(id: string, name: string): CategoryAggregate {
  return CategoryAggregate.init({
    id: IdValueObject.init({ value: id }).result as IdValueObject,
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: CategoryNameValueObject.init({ value: name }).result as CategoryNameValueObject,
  }).result as CategoryAggregate;
}

const sellerView = {
  id: PRODUCT_ID, name: 'Test Product', description: 'Original description.', image_url: null,
  price: 10, seller_name: 'Seller', seller_id: 'seller-1',
  category_name: 'Electronics', category_id: CATEGORY_ID, inventory_ammount: 5,
};

function makeProductRepo(product: ProductAggregate, overrides: Partial<ProductRepository> = {}): ProductRepository {
  return {
    findById: jest.fn().mockResolvedValue(product),
    findIdsBySellerId: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    findForSellers: jest.fn().mockResolvedValue({ products: [sellerView], total: 1 }),
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

function makeSellerRepo(): SellerRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    findByRefreshToken: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

describe('EditProductService', () => {
  it('should edit product name', async () => {
    const product = buildProduct();
    const productRepo = makeProductRepo(product);
    const service = new EditProductService(productRepo, makeCategoryRepo(), makeSellerRepo());

    const result = await service.execute({
      productId: PRODUCT_ID,
      name: 'New Name',
    });

    expect(result.isSuccess).toBe(true);
    expect(productRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should create new category when editing to a non-existent category', async () => {
    const product = buildProduct(CATEGORY_ID);
    const productRepo = makeProductRepo(product, { countByCategoryId: jest.fn().mockResolvedValue(0) });
    const categoryRepo = makeCategoryRepo();
    const service = new EditProductService(productRepo, categoryRepo, makeSellerRepo());

    const result = await service.execute({
      productId: PRODUCT_ID,
      category: 'New Category',
    });

    expect(result.isSuccess).toBe(true);
    expect(categoryRepo.save).toHaveBeenCalledTimes(1);
    expect(categoryRepo.delete).toHaveBeenCalledTimes(1);
  });

  it('should reuse existing category', async () => {
    const product = buildProduct(CATEGORY_ID);
    const existingCat = buildCategory(CATEGORY2_ID, 'books');
    const productRepo = makeProductRepo(product, { countByCategoryId: jest.fn().mockResolvedValue(1) });
    const categoryRepo = makeCategoryRepo({ findByName: jest.fn().mockResolvedValue(existingCat) });
    const service = new EditProductService(productRepo, categoryRepo, makeSellerRepo());

    const result = await service.execute({
      productId: PRODUCT_ID,
      category: 'Books',
    });

    expect(result.isSuccess).toBe(true);
    expect(categoryRepo.save).not.toHaveBeenCalled();
  });

  it('should delete orphan category after edit', async () => {
    const product = buildProduct(CATEGORY_ID);
    const productRepo = makeProductRepo(product, { countByCategoryId: jest.fn().mockResolvedValue(0) });
    const categoryRepo = makeCategoryRepo();
    const service = new EditProductService(productRepo, categoryRepo, makeSellerRepo());

    const result = await service.execute({
      productId: PRODUCT_ID,
      category: 'New Category',
    });

    expect(result.isSuccess).toBe(true);
    expect(categoryRepo.delete).toHaveBeenCalledTimes(1);
  });

  it('should fail when product not found', async () => {
    const productRepo = makeProductRepo(null as any, { findById: jest.fn().mockResolvedValue(null) });
    const service = new EditProductService(productRepo, makeCategoryRepo(), makeSellerRepo());

    const result = await service.execute({ productId: 'non-existent' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Product not found.');
  });
});
