import { IBidirectionalMapper, IdValueObject, DateValueObject } from 'ddd-tool-kit';
import { Injectable } from '@nestjs/common';
import { ICategorySchema } from './schema/category.schema';
import { CategoryAggregate } from '../../domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../domain/value-objects/category-name/category-name.value-object';

@Injectable()
class CategoryMapper implements IBidirectionalMapper<ICategorySchema, CategoryAggregate> {
  toRightSide(leftSide: ICategorySchema): CategoryAggregate {
    return CategoryAggregate.init({
      id: IdValueObject.init({ value: leftSide.id }).result as IdValueObject,
      name: CategoryNameValueObject.init({ value: leftSide.name }).result as CategoryNameValueObject,
      createdAt: DateValueObject.init({ value: leftSide.created_at }).result as DateValueObject,
      updatedAt: DateValueObject.init({ value: leftSide.updated_at }).result as DateValueObject,
    }).result as CategoryAggregate;
  }

  toLeftSide(rightSide: CategoryAggregate): ICategorySchema {
    return {
      id: rightSide.id.value,
      name: rightSide.name.value,
      created_at: rightSide.createdAt.value,
      updated_at: rightSide.updatedAt.value,
    };
  }
}

export { CategoryMapper };
