import { Injectable } from '@nestjs/common';
import { IBidirectionalMapper, IdValueObject, DateValueObject } from 'ddd-tool-kit';
import { IOrderItemSchema } from './schema/order.schema';
import { OrderItemEntity } from '../../domain/entities/order-item/order-item.entity';
import { AmountValueObject } from '../../domain/value-objects/amount/amount.value-object';

@Injectable()
class OrderItemMapper implements IBidirectionalMapper<IOrderItemSchema, OrderItemEntity> {
  toRightSide(leftSide: IOrderItemSchema): OrderItemEntity {
    return OrderItemEntity.init({
      id: IdValueObject.init({ value: leftSide.id }).result as IdValueObject,
      productId: IdValueObject.init({ value: leftSide.product_id }).result as IdValueObject,
      ammount: AmountValueObject.init({ value: leftSide.ammount }).result as AmountValueObject,
      createdAt: DateValueObject.init({ value: leftSide.created_at }).result as DateValueObject,
      updatedAt: DateValueObject.init({ value: leftSide.updated_at }).result as DateValueObject,
    }).result as OrderItemEntity;
  }

  toLeftSide(rightSide: OrderItemEntity): IOrderItemSchema {
    return {
      id: rightSide.id.value,
      product_id: rightSide.productId.value,
      ammount: rightSide.ammount.value,
      created_at: rightSide.createdAt.value,
      updated_at: rightSide.updatedAt.value,
    };
  }
}

export { OrderItemMapper };
