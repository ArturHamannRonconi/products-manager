import {
  Entity,
  Output,
  IdValueObject,
  DateValueObject,
  verifyAllPropsExists,
  verifyAreValueObjects,
} from 'ddd-tool-kit';
import { IOrderItemProps } from './order-item.props';
import { INVALID_ORDER_ITEM } from './order-item.errors';
import { AmountValueObject } from '../../value-objects/amount/amount.value-object';

class OrderItemEntity extends Entity<IOrderItemProps> {
  private constructor(props: IOrderItemProps) {
    super(props);
  }

  get productId(): IdValueObject {
    return this.props.productId;
  }

  get ammount(): AmountValueObject {
    return this.props.ammount;
  }

  get createdAt(): DateValueObject {
    return this.props.createdAt!;
  }

  get updatedAt(): DateValueObject {
    return this.props.updatedAt!;
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    const valueObjects = ['productId', 'ammount', ...this.defaultValueObjects];
    const allPropsExists = verifyAllPropsExists(valueObjects, this);
    const areValueObjects = verifyAreValueObjects(['productId', 'ammount'], this);
    return allPropsExists && areValueObjects;
  }

  static init(props: IOrderItemProps) {
    const item = new OrderItemEntity(props);

    const isInvalidProps = !item.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_ORDER_ITEM);

    return Output.success(item);
  }
}

export { OrderItemEntity };
