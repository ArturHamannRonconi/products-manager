import { GetSellerInfoService } from './get-seller-info.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

describe('GetSellerInfoService', () => {
  it('should return seller info', async () => {
    const seller = SellerAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
      email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
      password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
      organizationName: OrganizationNameValueObject.init({ value: 'Acme' }).result as OrganizationNameValueObject,
      refreshTokens: [],
    }).result as SellerAggregate;

    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(seller),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const service = new GetSellerInfoService(repo);
    const result = await service.execute({ sellerId: seller.id.value });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { name: string; email: string };
    expect(output.name).toBe('John');
    expect(output.email).toBe('john@example.com');
  });

  it('should fail when seller not found', async () => {
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new GetSellerInfoService(repo);
    const result = await service.execute({ sellerId: IdValueObject.getDefault().value });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(404);
  });
});
