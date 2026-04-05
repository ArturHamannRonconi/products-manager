import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';
import { SellerAggregate } from './seller.aggregate-root';
import { NameValueObject } from './value-objects/name/name.value-object';
import { EmailValueObject } from './value-objects/email/email.value-object';
import { OrganizationNameValueObject } from './value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../shared/value-objects/password/password.value-object';
import { RefreshTokenEntity } from './entities/refresh-token/refresh-token.entity';

function buildSeller(overrides: Partial<Parameters<typeof SellerAggregate.init>[0]> = {}) {
  const expiresAt = DateValueObject.getDefault();
  expiresAt.addDays(30);

  return SellerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John Doe' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    organizationName: OrganizationNameValueObject.init({ value: 'Acme Corp' }).result as OrganizationNameValueObject,
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

describe('SellerAggregate', () => {
  it('should create a valid seller', () => {
    const result = buildSeller();
    expect(result.isSuccess).toBe(true);
  });

  it('should fail with invalid props', () => {
    const result = SellerAggregate.init({} as any);
    expect(result.isFailure).toBe(true);
  });

  it('should changeName', () => {
    const seller = buildSeller().result as SellerAggregate;
    const newName = NameValueObject.init({ value: 'Jane Doe' }).result as NameValueObject;
    seller.changeName(newName);
    expect(seller.name.value).toBe('Jane Doe');
  });

  it('should changeEmail', () => {
    const seller = buildSeller().result as SellerAggregate;
    const newEmail = EmailValueObject.init({ value: 'jane@example.com' }).result as EmailValueObject;
    seller.changeEmail(newEmail);
    expect(seller.email.value).toBe('jane@example.com');
  });

  it('should changeOrganizationName', () => {
    const seller = buildSeller().result as SellerAggregate;
    const newOrg = OrganizationNameValueObject.init({ value: 'New Corp' }).result as OrganizationNameValueObject;
    seller.changeOrganizationName(newOrg);
    expect(seller.organizationName.value).toBe('New Corp');
  });

  it('should changePassword', () => {
    const seller = buildSeller().result as SellerAggregate;
    const newPassword = PasswordValueObject.init({ value: 'newpassword123' }).result as PasswordValueObject;
    seller.changePassword(newPassword);
    expect(seller.validatePassword('newpassword123')).toBe(true);
  });

  it('should addRefreshToken', () => {
    const seller = buildSeller().result as SellerAggregate;
    const token = buildToken();
    seller.addRefreshToken(token);
    expect(seller.refreshTokens).toHaveLength(1);
  });

  it('should removeRefreshToken by raw id value', () => {
    const seller = buildSeller().result as SellerAggregate;
    const token = buildToken();
    const rawId = token.id.value;
    seller.addRefreshToken(token);
    expect(seller.refreshTokens).toHaveLength(1);

    // bcryptjs.compareSync(rawId, token.id.value) must return true to trigger removal
    jest.spyOn(bcryptjs, 'compareSync').mockReturnValueOnce(true);
    seller.removeRefreshToken(rawId);

    expect(seller.refreshTokens).toHaveLength(0);
    jest.restoreAllMocks();
  });

  it('should validatePassword correctly', () => {
    const seller = buildSeller().result as SellerAggregate;
    expect(seller.validatePassword('password123')).toBe(true);
    expect(seller.validatePassword('wrongpassword')).toBe(false);
  });
});
