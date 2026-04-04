import { AmountValueObject } from './amount.value-object';

describe('AmountValueObject', () => {
  it('should accept 1', () => {
    const result = AmountValueObject.init({ value: 1 });
    expect(result.isSuccess).toBe(true);
    expect((result.result as AmountValueObject).value).toBe(1);
  });

  it('should reject 0', () => {
    const result = AmountValueObject.init({ value: 0 });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Amount must be at least 1.');
  });

  it('should reject 1.5 (non-integer)', () => {
    const result = AmountValueObject.init({ value: 1.5 });
    expect(result.isFailure).toBe(true);
  });
});
