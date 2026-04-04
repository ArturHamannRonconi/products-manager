import { ProductDescriptionValueObject } from './product-description.value-object';

describe('ProductDescriptionValueObject', () => {
  it('should create with a valid description', () => {
    const result = ProductDescriptionValueObject.init({ value: 'A great product.' });
    expect(result.isSuccess).toBe(true);
  });

  it('should fail with empty description', () => {
    const result = ProductDescriptionValueObject.init({ value: '' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Product description must be between 1 and 1000 characters.');
  });

  it('should fail with description that is too long (1001 chars)', () => {
    const result = ProductDescriptionValueObject.init({ value: 'a'.repeat(1001) });
    expect(result.isFailure).toBe(true);
  });

  it('should trim whitespace', () => {
    const result = ProductDescriptionValueObject.init({ value: '  Good product  ' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as ProductDescriptionValueObject;
    expect(vo.value).toBe('Good product');
  });
});
