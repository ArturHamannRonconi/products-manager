import { CreateBatchSellersService } from './create-batch-sellers.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

function makeRepo(overrides: Partial<SellerRepository> = {}): SellerRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    findByRefreshToken: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CreateBatchSellersService', () => {
  it('should create sellers successfully', async () => {
    const repo = makeRepo();
    const service = new CreateBatchSellersService(repo);

    const result = await service.execute({
      sellers: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          organization_name: 'Acme Corp',
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { sellers: { id: string }[] };
    expect(output.sellers).toHaveLength(1);
    expect(output.sellers[0].id).toBeDefined();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail with SELLER_EMAIL_ALREADY_EXISTS when email is taken', async () => {
    const existingSeller = SellerAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      name: NameValueObject.init({ value: 'Existing' }).result as NameValueObject,
      email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
      password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
      organizationName: OrganizationNameValueObject.init({ value: 'Corp' }).result as OrganizationNameValueObject,
      refreshTokens: [],
    }).result as SellerAggregate;

    const repo = makeRepo({ findByEmail: jest.fn().mockResolvedValue(existingSeller) });
    const service = new CreateBatchSellersService(repo);

    const result = await service.execute({
      sellers: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          organization_name: 'Acme Corp',
        },
      ],
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string; statusCode: number };
    expect(error.message).toBe('Seller email already exists!');
    expect(error.statusCode).toBe(409);
  });
});
