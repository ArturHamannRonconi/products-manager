import { CategoryNameValueObject } from './category-name.value-object';

describe('CategoryNameValueObject', () => {
  it('should create a valid name with 1 character', () => {
    const result = CategoryNameValueObject.init({ value: 'a' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as CategoryNameValueObject;
    expect(vo.value).toBe('a');
  });

  it('should create a valid name with 100 characters', () => {
    const result = CategoryNameValueObject.init({ value: 'a'.repeat(100) });
    expect(result.isSuccess).toBe(true);
  });

  it('should fail when name is empty', () => {
    const result = CategoryNameValueObject.init({ value: '' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Category name must be between 1 and 100 characters.');
  });

  it('should sanitize by converting to lowercase', () => {
    const result = CategoryNameValueObject.init({ value: 'Electronics' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as CategoryNameValueObject;
    expect(vo.value).toBe('electronics');
  });

  it('should sanitize by trimming leading and trailing spaces', () => {
    const result = CategoryNameValueObject.init({ value: '  Books  ' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as CategoryNameValueObject;
    expect(vo.value).toBe('books');
  });
});
