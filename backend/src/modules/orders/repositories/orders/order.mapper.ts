import { Injectable } from '@nestjs/common';
import { IBidirectionalMapper, IdValueObject, DateValueObject } from 'ddd-tool-kit';
import { IOrderSchema } from './schema/order.schema';
import { OrderAggregate } from '../../domain/order.aggregate-root';
import { OrderStatusValueObject } from '../../domain/value-objects/order-status/order-status.value-object';
import { OrderItemMapper } from './order-item.mapper';

@Injectable()
class OrderMapper implements IBidirectionalMapper<IOrderSchema, OrderAggregate> {
  constructor(private readonly orderItemMapper: OrderItemMapper) {}

  toRightSide(leftSide: IOrderSchema): OrderAggregate {
    return OrderAggregate.init({
      id: IdValueObject.init({ value: leftSide.id }).result as IdValueObject,
      status: OrderStatusValueObject.init({ value: leftSide.status }).result as OrderStatusValueObject,
      customerId: IdValueObject.init({ value: leftSide.customer_id }).result as IdValueObject,
      products: leftSide.products.map((item) => this.orderItemMapper.toRightSide(item)),
      createdAt: DateValueObject.init({ value: leftSide.created_at }).result as DateValueObject,
      updatedAt: DateValueObject.init({ value: leftSide.updated_at }).result as DateValueObject,
    }).result as OrderAggregate;
  }

  toLeftSide(rightSide: OrderAggregate): IOrderSchema {
    return {
      id: rightSide.id.value,
      status: rightSide.status.value,
      customer_id: rightSide.customerId.value,
      products: rightSide.products.map((item) => this.orderItemMapper.toLeftSide(item)),
      created_at: rightSide.createdAt.value,
      updated_at: rightSide.updatedAt.value,
    };
  }
}

export { OrderMapper };
