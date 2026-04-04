import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_NAME } from './name.errors';
import { INameValueObject } from './name.props';

class NameValueObject extends ValueObject<INameValueObject> {
  private constructor(props: INameValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {
    this.props.value = this.props.value.trim();
  }

  protected isValidProps(): boolean {
    const trimmed = this.props.value.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
  }

  static init(props: INameValueObject) {
    const vo = new NameValueObject(props);
    vo.sanitizeProps();

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_NAME);

    return Output.success(vo);
  }
}

export { NameValueObject };
