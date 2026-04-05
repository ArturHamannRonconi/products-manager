import { Output, ValueObject, IBaseDomainValueObject, HttpStatus } from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';

const INVALID_PASSWORD = {
  message: 'Password must be at least 8 characters.',
  statusCode: HttpStatus.BAD_REQUEST,
};

class PasswordValueObject extends ValueObject<IBaseDomainValueObject<string>> {
  private rawValue!: string;

  private constructor(props: IBaseDomainValueObject<string>) {
    super(props);
  }

  protected sanitizeProps(): void {
    this.rawValue = this.props.value;
    if (this.props.value.startsWith('$2')) return;
    this.props.value = bcryptjs.hashSync(
      this.props.value,
      bcryptjs.genSaltSync(),
    );
  }

  protected isValidProps(): boolean {
    if (this.rawValue.startsWith('$2')) return true;
    return this.rawValue.length >= 8;
  }

  comparePassword(plain: string): boolean {
    return bcryptjs.compareSync(plain, this.props.value);
  }

  static init(props: IBaseDomainValueObject<string>) {
    const password = new PasswordValueObject(props);

    const isInvalidProps = !password.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_PASSWORD);

    password.sanitizeProps();
    return Output.success(password);
  }
}

export { PasswordValueObject };
