import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_EMAIL } from './email.errors';
import { IEmailValueObject } from './email.props';

class EmailValueObject extends ValueObject<IEmailValueObject> {
  private constructor(props: IEmailValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {
    this.props.value = this.props.value.toLowerCase().trim();
  }

  protected isValidProps(): boolean {
    return /.+@.+\..+/.test(this.props.value);
  }

  static init(props: IEmailValueObject) {
    const vo = new EmailValueObject(props);
    vo.sanitizeProps();

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_EMAIL);

    return Output.success(vo);
  }
}

export { EmailValueObject };
