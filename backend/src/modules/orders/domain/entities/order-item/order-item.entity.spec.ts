import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { OrderItemEntity } from './order-item.entity';
import { AmountValueObject } from '../../value-objects/amount/amount.value-object';

describe('OrderItemEntity', () => {
  it('should create a valid order item', () => {
    const result = OrderItemEntity.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      productId: IdValueObject.getDefault(),
      ammount: AmountValueObject.init({ value: 3 }).result as AmountValueObject,
    });

    expect(result.isSuccess).toBe(true);
    const item = result.result as OrderItemEntity;
    expect(item.ammount.value).toBe(3);
  });

  it('should fail with invalid amount', () => {
    const result = OrderItemEntity.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      productId: IdValueObject.getDefault(),
      ammount: AmountValueObject.init({ value: 0 }).result as AmountValueObject,
    });

    expect(result.isFailure).toBe(true);
  });
});
