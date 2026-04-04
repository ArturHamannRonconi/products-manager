import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_PRICE } from './price.errors';
import { IPriceValueObject } from './price.props';

class PriceValueObject extends ValueObject<IPriceValueObject> {
  private constructor(props: IPriceValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    return typeof this.props.value === 'number' && this.props.value > 0;
  }

  static init(props: IPriceValueObject) {
    const vo = new PriceValueObject(props);

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_PRICE);

    return Output.success(vo);
  }
}

export { PriceValueObject };
