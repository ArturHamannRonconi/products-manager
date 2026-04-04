import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_PRODUCT_NAME } from './product-name.errors';
import { IProductNameValueObject } from './product-name.props';

class ProductNameValueObject extends ValueObject<IProductNameValueObject> {
  private constructor(props: IProductNameValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {
    this.props.value = this.props.value.trim();
  }

  protected isValidProps(): boolean {
    return this.props.value.length >= 1 && this.props.value.length <= 200;
  }

  static init(props: IProductNameValueObject) {
    const vo = new ProductNameValueObject(props);
    vo.sanitizeProps();

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_PRODUCT_NAME);

    return Output.success(vo);
  }
}

export { ProductNameValueObject };
