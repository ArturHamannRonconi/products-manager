import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_CATEGORY_NAME } from './category-name.errors';
import { ICategoryNameValueObject } from './category-name.props';

class CategoryNameValueObject extends ValueObject<ICategoryNameValueObject> {
  private constructor(props: ICategoryNameValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {
    this.props.value = this.props.value.trim().toLowerCase();
  }

  protected isValidProps(): boolean {
    return this.props.value.length >= 1 && this.props.value.length <= 100;
  }

  static init(props: ICategoryNameValueObject) {
    const vo = new CategoryNameValueObject(props);
    vo.sanitizeProps();

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_CATEGORY_NAME);

    return Output.success(vo);
  }
}

export { CategoryNameValueObject };
