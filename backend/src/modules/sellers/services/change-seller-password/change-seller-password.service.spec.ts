import { ChangeSellerPasswordService } from './change-seller-password.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

function buildSeller() {
  return SellerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'oldpassword123' }).result as PasswordValueObject,
    organizationName: OrganizationNameValueObject.init({ value: 'Acme' }).result as OrganizationNameValueObject,
    refreshTokens: [],
  }).result as SellerAggregate;
}

describe('ChangeSellerPasswordService', () => {
  it('should change password successfully', async () => {
    const seller = buildSeller();
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(seller),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeSellerPasswordService(repo);
    const result = await service.execute({
      sellerId: seller.id.value,
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword456',
    });
    expect(result.isSuccess).toBe(true);
    expect(seller.validatePassword('newpassword456')).toBe(true);
  });

  it('should fail when old password is wrong', async () => {
    const seller = buildSeller();
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(seller),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeSellerPasswordService(repo);
    const result = await service.execute({
      sellerId: seller.id.value,
      oldPassword: 'wrongpassword',
      newPassword: 'newpassword456',
    });
    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(401);
  });
});
