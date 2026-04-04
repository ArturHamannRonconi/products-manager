import { InventoryAmountValueObject } from './inventory-amount.value-object';

describe('InventoryAmountValueObject', () => {
  it('should create with zero amount', () => {
    const result = InventoryAmountValueObject.init({ value: 0 });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as InventoryAmountValueObject;
    expect(vo.value).toBe(0);
  });

  it('should create with positive integer amount', () => {
    const result = InventoryAmountValueObject.init({ value: 100 });
    expect(result.isSuccess).toBe(true);
  });

  it('should fail with negative amount', () => {
    const result = InventoryAmountValueObject.init({ value: -1 });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Inventory amount must be a non-negative integer.');
  });

  it('should fail with non-integer amount', () => {
    const result = InventoryAmountValueObject.init({ value: 1.5 });
    expect(result.isFailure).toBe(true);
  });
});
