import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_PRODUCT_DESCRIPTION } from './product-description.errors';
import { IProductDescriptionValueObject } from './product-description.props';

class ProductDescriptionValueObject extends ValueObject<IProductDescriptionValueObject> {
  private constructor(props: IProductDescriptionValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {
    this.props.value = this.props.value.trim();
  }

  protected isValidProps(): boolean {
    return this.props.value.length >= 1 && this.props.value.length <= 1000;
  }

  static init(props: IProductDescriptionValueObject) {
    const vo = new ProductDescriptionValueObject(props);
    vo.sanitizeProps();

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_PRODUCT_DESCRIPTION);

    return Output.success(vo);
  }
}

export { ProductDescriptionValueObject };
