import { ChangeSellerOrganizationService } from './change-seller-organization.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

describe('ChangeSellerOrganizationService', () => {
  it('should change organization name', async () => {
    const seller = SellerAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
      email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
      password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
      organizationName: OrganizationNameValueObject.init({ value: 'Old Corp' }).result as OrganizationNameValueObject,
      refreshTokens: [],
    }).result as SellerAggregate;

    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(seller),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeSellerOrganizationService(repo);
    const result = await service.execute({
      sellerId: seller.id.value,
      name: 'New Corp',
    });
    expect(result.isSuccess).toBe(true);
    expect(seller.organizationName.value).toBe('New Corp');
  });
});
