import { ChangeSellerEmailService } from './change-seller-email.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

function buildSeller(email = 'john@example.com') {
  return SellerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: email }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    organizationName: OrganizationNameValueObject.init({ value: 'Acme' }).result as OrganizationNameValueObject,
    refreshTokens: [],
  }).result as SellerAggregate;
}

describe('ChangeSellerEmailService', () => {
  it('should change email successfully', async () => {
    const seller = buildSeller();
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(seller),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeSellerEmailService(repo);
    const result = await service.execute({
      sellerId: seller.id.value,
      email: 'new@example.com',
    });
    expect(result.isSuccess).toBe(true);
    expect(seller.email.value).toBe('new@example.com');
  });

  it('should fail when email is taken by another seller', async () => {
    const seller = buildSeller();
    const other = buildSeller('other@example.com');
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(seller),
      findByEmail: jest.fn().mockResolvedValue(other),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeSellerEmailService(repo);
    const result = await service.execute({
      sellerId: seller.id.value,
      email: 'other@example.com',
    });
    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(409);
  });
});
