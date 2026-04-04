import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdValueObject } from 'ddd-tool-kit';
import { CategoryRepository } from '../../category-repository.interface';
import { ICategorySchema } from '../../schema/category.schema';
import { CategoryAggregate } from '../../../../domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../../../domain/value-objects/category-name/category-name.value-object';
import { CategoryMapper } from '../../category.mapper';

@Injectable()
class MongooseCategoryRepository implements CategoryRepository {
  constructor(
    @InjectModel('Category') private readonly CategoryModel: Model<ICategorySchema>,
    private readonly categoryMapper: CategoryMapper,
  ) {}

  async findById(id: IdValueObject): Promise<CategoryAggregate | null> {
    const schema = await this.CategoryModel.findOne({ id: id.value }).lean();
    if (!schema) return null;
    return this.categoryMapper.toRightSide(schema as ICategorySchema);
  }

  async findByName(name: CategoryNameValueObject): Promise<CategoryAggregate | null> {
    const schema = await this.CategoryModel.findOne({ name: name.value }).lean();
    if (!schema) return null;
    return this.categoryMapper.toRightSide(schema as ICategorySchema);
  }

  async save(category: CategoryAggregate): Promise<void> {
    const alreadyExists = await this.CategoryModel.exists({ id: category.id.value });
    const schema = this.categoryMapper.toLeftSide(category);

    if (!alreadyExists) {
      await this.CategoryModel.insertOne(schema);
    } else {
      schema.updated_at = new Date();
      await this.CategoryModel.replaceOne({ id: schema.id }, schema);
    }
  }

  async delete(id: IdValueObject): Promise<void> {
    await this.CategoryModel.deleteOne({ id: id.value });
  }
}

export { MongooseCategoryRepository };
