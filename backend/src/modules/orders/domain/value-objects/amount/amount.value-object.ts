import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_AMOUNT } from './amount.errors';
import { IAmountValueObject } from './amount.props';

class AmountValueObject extends ValueObject<IAmountValueObject> {
  private constructor(props: IAmountValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    return Number.isInteger(this.props.value) && this.props.value >= 1;
  }

  static init(props: IAmountValueObject) {
    const amount = new AmountValueObject(props);

    const isInvalidProps = !amount.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_AMOUNT);

    return Output.success(amount);
  }
}

export { AmountValueObject };
