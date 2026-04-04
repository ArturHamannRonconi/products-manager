import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { MongooseCategoryRepository } from './mongoose.category-repository';
import { CategorySchema, ICategorySchema } from '../../schema/category.schema';
import { CategoryMapper } from '../../category.mapper';
import { CategoryAggregate } from '../../../../domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../../../domain/value-objects/category-name/category-name.value-object';

function buildCategory(name = 'electronics'): CategoryAggregate {
  return CategoryAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: CategoryNameValueObject.init({ value: name }).result as CategoryNameValueObject,
  }).result as CategoryAggregate;
}

describe('MongooseCategoryRepository', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongooseCategoryRepository;
  let model: Model<ICategorySchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
      ],
      providers: [
        CategoryMapper,
        {
          provide: MongooseCategoryRepository,
          useFactory: (categoryModel: Model<ICategorySchema>, categoryMapper: CategoryMapper) =>
            new MongooseCategoryRepository(categoryModel, categoryMapper),
          inject: [getModelToken('Category'), CategoryMapper],
        },
      ],
    }).compile();

    repository = module.get(MongooseCategoryRepository);
    model = module.get<Model<ICategorySchema>>(getModelToken('Category'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await model.deleteMany({});
  });

  it('should insert a new category', async () => {
    const category = buildCategory();
    await repository.save(category);
    const found = await repository.findById(category.id);
    expect(found).not.toBeNull();
    expect(found!.id.value).toBe(category.id.value);
  });

  it('should update an existing category', async () => {
    const category = buildCategory('books');
    await repository.save(category);
    await repository.save(category);
    const found = await repository.findById(category.id);
    expect(found).not.toBeNull();
  });

  it('should findByName (case-insensitive via value-object normalization)', async () => {
    const category = buildCategory('electronics');
    await repository.save(category);

    const name = CategoryNameValueObject.init({ value: 'Electronics' }).result as CategoryNameValueObject;
    const found = await repository.findByName(name);
    expect(found).not.toBeNull();
    expect(found!.name.value).toBe('electronics');
  });

  it('should return null when findById not found', async () => {
    const id = IdValueObject.getDefault();
    const found = await repository.findById(id);
    expect(found).toBeNull();
  });

  it('should delete a category', async () => {
    const category = buildCategory();
    await repository.save(category);
    await repository.delete(category.id);
    const found = await repository.findById(category.id);
    expect(found).toBeNull();
  });
});
