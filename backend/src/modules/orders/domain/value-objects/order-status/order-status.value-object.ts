import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_ORDER_STATUS } from './order-status.errors';
import { IOrderStatusValueObject } from './order-status.props';

class OrderStatusValueObject extends ValueObject<IOrderStatusValueObject> {
  private constructor(props: IOrderStatusValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(this.props.value);
  }

  static init(props: IOrderStatusValueObject) {
    const status = new OrderStatusValueObject(props);

    const isInvalidProps = !status.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_ORDER_STATUS);

    return Output.success(status);
  }
}

export { OrderStatusValueObject };
