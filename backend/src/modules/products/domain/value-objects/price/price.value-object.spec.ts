import { PriceValueObject } from './price.value-object';

describe('PriceValueObject', () => {
  it('should create with a valid positive price', () => {
    const result = PriceValueObject.init({ value: 9.99 });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as PriceValueObject;
    expect(vo.value).toBe(9.99);
  });

  it('should fail with price of 0', () => {
    const result = PriceValueObject.init({ value: 0 });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Price must be greater than 0.');
  });

  it('should fail with negative price', () => {
    const result = PriceValueObject.init({ value: -5 });
    expect(result.isFailure).toBe(true);
  });

  it('should accept fractional prices', () => {
    const result = PriceValueObject.init({ value: 0.01 });
    expect(result.isSuccess).toBe(true);
  });
});
