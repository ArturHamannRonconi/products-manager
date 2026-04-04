import { OrderStatusValueObject } from './order-status.value-object';

describe('OrderStatusValueObject', () => {
  it.each(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])(
    'should accept "%s"',
    (status) => {
      const result = OrderStatusValueObject.init({ value: status });
      expect(result.isSuccess).toBe(true);
      expect((result.result as OrderStatusValueObject).value).toBe(status);
    },
  );

  it('should reject invalid status', () => {
    const result = OrderStatusValueObject.init({ value: 'Pending' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Invalid order status.');
  });

  it('should reject legacy capitalized values', () => {
    for (const legacy of ['Approved', 'Canceled']) {
      const result = OrderStatusValueObject.init({ value: legacy });
      expect(result.isFailure).toBe(true);
    }
  });
});
