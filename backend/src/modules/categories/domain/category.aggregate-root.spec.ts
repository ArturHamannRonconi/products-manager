import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { CategoryAggregate } from './category.aggregate-root';
import { CategoryNameValueObject } from './value-objects/category-name/category-name.value-object';

function buildCategory(overrides: Partial<Parameters<typeof CategoryAggregate.init>[0]> = {}) {
  return CategoryAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: CategoryNameValueObject.init({ value: 'electronics' }).result as CategoryNameValueObject,
    ...overrides,
  });
}

describe('CategoryAggregate', () => {
  it('should create a valid category', () => {
    const result = buildCategory();
    expect(result.isSuccess).toBe(true);
  });

  it('should fail with invalid props', () => {
    const result = CategoryAggregate.init({} as any);
    expect(result.isFailure).toBe(true);
  });

  it('should expose the name value object', () => {
    const category = buildCategory().result as CategoryAggregate;
    expect(category.name.value).toBe('electronics');
  });
});
