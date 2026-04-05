import { UploadProductImageService } from './upload-product-image.service';
import { ProductRepository } from '../../repositories/products/product-repository.interface';
import { IFileProvider } from '../../../../providers/file/file.interface';
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
    categoryId: IdValueObject.getDefault(),
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
    findForSellers: jest.fn().mockResolvedValue({
      products: [{
        id: 'product-1', name: 'Test Product', description: 'Desc.', image_url: 'https://s3.example.com/img.jpg',
        price: 10, seller_name: 'Seller', seller_id: 'seller-1',
        category_name: 'Electronics', category_id: 'cat-1', inventory_ammount: 5,
      }],
      total: 1,
    }),
    findForCustomers: jest.fn().mockResolvedValue({ products: [], total: 0 }),
    countByCategoryId: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function makeFileProvider(): IFileProvider {
  return {
    upload: jest.fn().mockResolvedValue({ url: 'https://s3.example.com/img.jpg' }),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

describe('UploadProductImageService', () => {
  it('should upload image and update product', async () => {
    const productRepo = makeProductRepo();
    const fileProvider = makeFileProvider();
    const service = new UploadProductImageService(productRepo, fileProvider);

    const result = await service.execute({
      productId: 'product-1',
      file: {
        filename: 'test.jpg',
        buffer: Buffer.from('fake'),
        mimetype: 'image/jpeg',
      },
    });

    expect(result.isSuccess).toBe(true);
    expect(fileProvider.upload).toHaveBeenCalledTimes(1);
    expect(productRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail when product not found', async () => {
    const productRepo = makeProductRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const fileProvider = makeFileProvider();
    const service = new UploadProductImageService(productRepo, fileProvider);

    const result = await service.execute({
      productId: 'non-existent',
      file: {
        filename: 'test.jpg',
        buffer: Buffer.from('fake'),
        mimetype: 'image/jpeg',
      },
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Product not found.');
  });
});
