import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { CustomerAggregate } from './customer.aggregate-root';
import { NameValueObject } from './value-objects/name/name.value-object';
import { EmailValueObject } from './value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../shared/value-objects/password/password.value-object';
import { RefreshTokenEntity } from './entities/refresh-token/refresh-token.entity';

function buildCustomer(overrides: Partial<Parameters<typeof CustomerAggregate.init>[0]> = {}) {
  return CustomerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John Doe' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    refreshTokens: [],
    ...overrides,
  });
}

function buildToken() {
  const expiresAt = DateValueObject.getDefault();
  expiresAt.addDays(30);
  return RefreshTokenEntity.init({
    id: IdValueObject.getDefault(),
    expiresAt,
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
  }).result as RefreshTokenEntity;
}

describe('CustomerAggregate', () => {
  it('should create a valid customer', () => {
    const result = buildCustomer();
    expect(result.isSuccess).toBe(true);
  });

  it('should fail with invalid props', () => {
    const result = CustomerAggregate.init({} as any);
    expect(result.isFailure).toBe(true);
  });

  it('should changeName', () => {
    const customer = buildCustomer().result as CustomerAggregate;
    const newName = NameValueObject.init({ value: 'Jane Doe' }).result as NameValueObject;
    customer.changeName(newName);
    expect(customer.name.value).toBe('Jane Doe');
  });

  it('should changeEmail', () => {
    const customer = buildCustomer().result as CustomerAggregate;
    const newEmail = EmailValueObject.init({ value: 'jane@example.com' }).result as EmailValueObject;
    customer.changeEmail(newEmail);
    expect(customer.email.value).toBe('jane@example.com');
  });

  it('should changePassword', () => {
    const customer = buildCustomer().result as CustomerAggregate;
    const newPassword = PasswordValueObject.init({ value: 'newpassword123' }).result as PasswordValueObject;
    customer.changePassword(newPassword);
    expect(customer.validatePassword('newpassword123')).toBe(true);
  });

  it('should addRefreshToken', () => {
    const customer = buildCustomer().result as CustomerAggregate;
    const token = buildToken();
    customer.addRefreshToken(token);
    expect(customer.refreshTokens).toHaveLength(1);
  });

  it('should removeRefreshToken by raw id value', () => {
    const customer = buildCustomer().result as CustomerAggregate;
    const token = buildToken();
    const rawId = token.id.value;
    customer.addRefreshToken(token);
    expect(customer.refreshTokens).toHaveLength(1);
    customer.removeRefreshToken(rawId);
    expect(customer.refreshTokens).toHaveLength(0);
  });

  it('should validatePassword correctly', () => {
    const customer = buildCustomer().result as CustomerAggregate;
    expect(customer.validatePassword('password123')).toBe(true);
    expect(customer.validatePassword('wrongpassword')).toBe(false);
  });
});
