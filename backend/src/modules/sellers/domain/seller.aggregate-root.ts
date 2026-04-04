import {
  Aggregate,
  Output,
  verifyAllPropsExists,
  verifyAreValueObjects,
} from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';
import { ISellerProps } from './seller.props';
import { SELLER_INVALID_PROPS } from './seller.errors';
import { NameValueObject } from './value-objects/name/name.value-object';
import { EmailValueObject } from './value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../shared/value-objects/password/password.value-object';
import { OrganizationNameValueObject } from './value-objects/organization-name/organization-name.value-object';
import { RefreshTokenEntity } from './entities/refresh-token/refresh-token.entity';

class SellerAggregate extends Aggregate<ISellerProps> {
  private constructor(props: ISellerProps) {
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

  get organizationName(): OrganizationNameValueObject {
    return this.props.organizationName;
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

  changeOrganizationName(organizationName: OrganizationNameValueObject): void {
    this.props.organizationName = organizationName;
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
      'organizationName',
      ...this.defaultValueObjects,
    ];
    const requiredProps = [...valueObjects];
    const allPropsExists = verifyAllPropsExists(requiredProps, this);
    const areValueObjects = verifyAreValueObjects(
      ['name', 'email', 'password', 'organizationName', ...this.defaultValueObjects],
      this,
    );
    return allPropsExists && areValueObjects;
  }

  static init(props: ISellerProps) {
    const seller = new SellerAggregate(props);

    const isInvalidProps = !seller.isValidProps();
    if (isInvalidProps) return Output.fail(SELLER_INVALID_PROPS);

    return Output.success(seller);
  }
}

export { SellerAggregate };
