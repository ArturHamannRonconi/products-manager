import {
  Aggregate,
  Output,
  verifyAllPropsExists,
  verifyAreValueObjects,
} from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';
import { ICustomerProps } from './customer.props';
import { CUSTOMER_INVALID_PROPS } from './customer.errors';
import { NameValueObject } from './value-objects/name/name.value-object';
import { EmailValueObject } from './value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../shared/value-objects/password/password.value-object';
import { RefreshTokenEntity } from './entities/refresh-token/refresh-token.entity';

class CustomerAggregate extends Aggregate<ICustomerProps> {
  private constructor(props: ICustomerProps) {
    super(props);
  }

  get name(): NameValueObject {
    return this.props.name;
  }

  get email(): EmailValueObject {
    return this.props.email;
  }

  get password(): PasswordValueObject {
    return this.props.password;
  }

  get refreshTokens(): RefreshTokenEntity[] {
    return this.props.refreshTokens;
  }

  changeName(name: NameValueObject): void {
    this.props.name = name;
  }

  changeEmail(email: EmailValueObject): void {
    this.props.email = email;
  }

  changePassword(password: PasswordValueObject): void {
    this.props.password = password;
  }

  addRefreshToken(token: RefreshTokenEntity): void {
    this.props.refreshTokens.push(token);
  }

  removeRefreshToken(tokenValue: string): void {
    this.props.refreshTokens = this.props.refreshTokens.filter(
      (token) => !bcryptjs.compareSync(tokenValue, token.id.value),
    );
  }

  clearRefreshTokens(): void {
    this.props.refreshTokens = [];
  }

  validatePassword(plain: string): boolean {
    return this.props.password.comparePassword(plain);
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    const valueObjects = [
      'name',
      'email',
      'password',
      ...this.defaultValueObjects,
    ];
    const requiredProps = [...valueObjects];
    const allPropsExists = verifyAllPropsExists(requiredProps, this);
    const areValueObjects = verifyAreValueObjects(
      ['name', 'email', 'password', ...this.defaultValueObjects],
      this,
    );
    return allPropsExists && areValueObjects;
  }

  static init(props: ICustomerProps) {
    const customer = new CustomerAggregate(props);

    const isInvalidProps = !customer.isValidProps();
    if (isInvalidProps) return Output.fail(CUSTOMER_INVALID_PROPS);

    return Output.success(customer);
  }
}

export { CustomerAggregate };
