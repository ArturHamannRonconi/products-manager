import { ProductNameValueObject } from './product-name.value-object';

describe('ProductNameValueObject', () => {
  it('should create with a valid name', () => {
    const result = ProductNameValueObject.init({ value: 'Product Name' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as ProductNameValueObject;
    expect(vo.value).toBe('Product Name');
  });

  it('should fail with empty name', () => {
    const result = ProductNameValueObject.init({ value: '' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string; statusCode: number };
    expect(error.message).toBe('Product name must be between 1 and 200 characters.');
  });

  it('should fail with name that is too long (201 chars)', () => {
    const result = ProductNameValueObject.init({ value: 'a'.repeat(201) });
    expect(result.isFailure).toBe(true);
  });

  it('should trim whitespace', () => {
    const result = ProductNameValueObject.init({ value: '  Trimmed Name  ' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as ProductNameValueObject;
    expect(vo.value).toBe('Trimmed Name');
  });
});
