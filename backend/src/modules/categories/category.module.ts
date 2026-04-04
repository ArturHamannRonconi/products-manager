import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategorySchema, ICategorySchema } from './repositories/categories/schema/category.schema';
import { CategoryMapper } from './repositories/categories/category.mapper';
import { MongooseCategoryRepository } from './repositories/categories/implementations/mongoose/mongoose.category-repository';

@Module({
  imports: [
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
  exports: [MongooseCategoryRepository],
})
export class CategoryModule {}
