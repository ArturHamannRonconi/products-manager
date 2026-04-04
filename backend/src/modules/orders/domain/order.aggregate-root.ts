import {
  Aggregate,
  Output,
  verifyAllPropsExists,
  verifyAreValueObjects,
  IdValueObject,
} from 'ddd-tool-kit';
import { IOrderProps } from './order.props';
import { INVALID_ORDER } from './order.errors';
import { OrderStatusValueObject } from './value-objects/order-status/order-status.value-object';
import { OrderItemEntity } from './entities/order-item/order-item.entity';

class OrderAggregate extends Aggregate<IOrderProps> {
  private constructor(props: IOrderProps) {
    super(props);
  }

  get status(): OrderStatusValueObject {
    return this.props.status;
  }

  get customerId(): IdValueObject {
    return this.props.customerId;
  }

  get products(): OrderItemEntity[] {
    return this.props.products;
  }

  changeStatus(status: OrderStatusValueObject): void {
    this.props.status = status;
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    const valueObjects = ['status', 'customerId', ...this.defaultValueObjects];
    const allPropsExists = verifyAllPropsExists(valueObjects, this);
    const areValueObjects = verifyAreValueObjects(['status', 'customerId'], this);
    const productsNotEmpty = Array.isArray(this.props.products) && this.props.products.length > 0;
    return allPropsExists && areValueObjects && productsNotEmpty;
  }

  static init(props: IOrderProps) {
    const order = new OrderAggregate(props);

    const isInvalidProps = !order.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_ORDER);

    return Output.success(order);
  }
}

export { OrderAggregate };
