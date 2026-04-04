import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_INVENTORY_AMOUNT } from './inventory-amount.errors';
import { IInventoryAmountValueObject } from './inventory-amount.props';

class InventoryAmountValueObject extends ValueObject<IInventoryAmountValueObject> {
  private constructor(props: IInventoryAmountValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    return Number.isInteger(this.props.value) && this.props.value >= 0;
  }

  static init(props: IInventoryAmountValueObject) {
    const vo = new InventoryAmountValueObject(props);

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_INVENTORY_AMOUNT);

    return Output.success(vo);
  }
}

export { InventoryAmountValueObject };
