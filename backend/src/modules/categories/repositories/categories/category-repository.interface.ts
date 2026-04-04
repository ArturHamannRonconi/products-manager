import { IdValueObject } from 'ddd-tool-kit';
import { CategoryAggregate } from '../../domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../domain/value-objects/category-name/category-name.value-object';

interface CategoryRepository {
  findById(id: IdValueObject): Promise<CategoryAggregate | null>;
  findByName(name: CategoryNameValueObject): Promise<CategoryAggregate | null>;
  save(category: CategoryAggregate): Promise<void>;
  delete(id: IdValueObject): Promise<void>;
}

export { CategoryRepository };
