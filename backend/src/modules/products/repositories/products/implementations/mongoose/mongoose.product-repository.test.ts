import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { MongooseProductRepository } from './mongoose.product-repository';
import { ProductSchema, IProductSchema } from '../../schema/product.schema';
import { ProductMapper } from '../../product.mapper';
import { ProductAggregate } from '../../../../domain/product.aggregate-root';
import { ProductNameValueObject } from '../../../../domain/value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from '../../../../domain/value-objects/product-description/product-description.value-object';
import { PriceValueObject } from '../../../../domain/value-objects/price/price.value-object';
import { ImageUrlValueObject } from '../../../../domain/value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from '../../../../domain/value-objects/inventory-amount/inventory-amount.value-object';

function buildProduct(name = 'Test Product', categoryId?: string, sellerId?: string): ProductAggregate {
  return ProductAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: ProductNameValueObject.init({ value: name }).result as ProductNameValueObject,
    description: ProductDescriptionValueObject.init({ value: 'A test description.' }).result as ProductDescriptionValueObject,
    price: PriceValueObject.init({ value: 9.99 }).result as PriceValueObject,
    imageUrl: ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject,
    sellerId: IdValueObject.init({ value: sellerId ?? 'seller-1' }).result as IdValueObject,
    categoryId: IdValueObject.init({ value: categoryId ?? 'category-1' }).result as IdValueObject,
    inventoryAmount: InventoryAmountValueObject.init({ value: 10 }).result as InventoryAmountValueObject,
  }).result as ProductAggregate;
}

describe('MongooseProductRepository', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongooseProductRepository;
  let model: Model<IProductSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
      ],
      providers: [
        ProductMapper,
        {
          provide: MongooseProductRepository,
          useFactory: (productModel: Model<IProductSchema>, productMapper: ProductMapper) =>
            new MongooseProductRepository(productModel, productMapper),
          inject: [getModelToken('Product'), ProductMapper],
        },
      ],
    }).compile();

    repository = module.get(MongooseProductRepository);
    model = module.get<Model<IProductSchema>>(getModelToken('Product'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await model.deleteMany({});
  });

  describe('save / findById', () => {
    it('should insert a new product', async () => {
      const product = buildProduct();
      await repository.save(product);
      const found = await repository.findById(product.id);
      expect(found).not.toBeNull();
      expect(found!.id.value).toBe(product.id.value);
    });

    it('should update an existing product', async () => {
      const product = buildProduct();
      await repository.save(product);
      await repository.save(product);
      const found = await repository.findById(product.id);
      expect(found).not.toBeNull();
    });

    it('should return null when product not found', async () => {
      const id = IdValueObject.getDefault();
      const found = await repository.findById(id);
      expect(found).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const product = buildProduct();
      await repository.save(product);
      await repository.delete(product.id);
      const found = await repository.findById(product.id);
      expect(found).toBeNull();
    });
  });

  describe('countByCategoryId', () => {
    it('should count products by category id', async () => {
      const p1 = buildProduct('P1', 'cat-a');
      const p2 = buildProduct('P2', 'cat-a');
      const p3 = buildProduct('P3', 'cat-b');
      await repository.save(p1);
      await repository.save(p2);
      await repository.save(p3);

      const catAId = IdValueObject.init({ value: 'cat-a' }).result as IdValueObject;
      const count = await repository.countByCategoryId(catAId);
      expect(count).toBe(2);
    });
  });

  describe('findForSellers', () => {
    it('should return products with pagination', async () => {
      const p1 = buildProduct('Alpha');
      const p2 = buildProduct('Beta');
      await repository.save(p1);
      await repository.save(p2);

      const result = await repository.findForSellers({ page: 1, size: 10 });
      expect(result.total).toBe(2);
      expect(result.products).toHaveLength(2);
    });

    it('should paginate correctly', async () => {
      const p1 = buildProduct('Alpha');
      const p2 = buildProduct('Beta');
      await repository.save(p1);
      await repository.save(p2);

      const result = await repository.findForSellers({ page: 1, size: 1 });
      expect(result.products).toHaveLength(1);
    });

    it('should cap page to last page when page > totalPages', async () => {
      const p1 = buildProduct('Alpha');
      await repository.save(p1);

      const result = await repository.findForSellers({ page: 999, size: 10 });
      expect(result.products).toHaveLength(1);
    });
  });

  describe('findForCustomers', () => {
    it('should return customer view products', async () => {
      const p1 = buildProduct('Customer Product');
      await repository.save(p1);

      const result = await repository.findForCustomers({ page: 1, size: 10 });
      expect(result.total).toBe(1);
      expect(result.products[0]).toHaveProperty('id');
      expect(result.products[0]).not.toHaveProperty('inventory_ammount');
    });
  });
});
