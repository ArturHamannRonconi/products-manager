import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { OrderAggregate } from './order.aggregate-root';
import { OrderStatusValueObject } from './value-objects/order-status/order-status.value-object';
import { OrderItemEntity } from './entities/order-item/order-item.entity';
import { AmountValueObject } from './value-objects/amount/amount.value-object';

function buildItem(): OrderItemEntity {
  return OrderItemEntity.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    productId: IdValueObject.getDefault(),
    ammount: AmountValueObject.init({ value: 2 }).result as AmountValueObject,
  }).result as OrderItemEntity;
}

describe('OrderAggregate', () => {
  it('should create a valid order with status "pending"', () => {
    const result = OrderAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      status: OrderStatusValueObject.init({ value: 'pending' }).result as OrderStatusValueObject,
      customerId: IdValueObject.getDefault(),
      products: [buildItem()],
    });

    expect(result.isSuccess).toBe(true);
    const order = result.result as OrderAggregate;
    expect(order.status.value).toBe('pending');
  });

  it('should fail when products is empty', () => {
    const result = OrderAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      status: OrderStatusValueObject.init({ value: 'pending' }).result as OrderStatusValueObject,
      customerId: IdValueObject.getDefault(),
      products: [],
    });

    expect(result.isFailure).toBe(true);
  });

  it('should change status', () => {
    const order = OrderAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      status: OrderStatusValueObject.init({ value: 'pending' }).result as OrderStatusValueObject,
      customerId: IdValueObject.getDefault(),
      products: [buildItem()],
    }).result as OrderAggregate;

    const newStatus = OrderStatusValueObject.init({ value: 'processing' }).result as OrderStatusValueObject;
    order.changeStatus(newStatus);
    expect(order.status.value).toBe('processing');
  });
});
