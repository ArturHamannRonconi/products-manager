import { IBaseDomainAggregate, IdValueObject } from 'ddd-tool-kit';
import { OrderStatusValueObject } from './value-objects/order-status/order-status.value-object';
import { OrderItemEntity } from './entities/order-item/order-item.entity';

interface IOrderProps extends IBaseDomainAggregate {
  status: OrderStatusValueObject;
  customerId: IdValueObject;
  products: OrderItemEntity[];
}

export { IOrderProps };
