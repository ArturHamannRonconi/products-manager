import { SellerLogoutService } from './seller-logout.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token/refresh-token.entity';

function buildSellerWithToken() {
  const expiresAt = DateValueObject.getDefault();
  expiresAt.addDays(30);
  const token = RefreshTokenEntity.init({
    id: IdValueObject.getDefault(),
    expiresAt,
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
  }).result as RefreshTokenEntity;

  return SellerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    organizationName: OrganizationNameValueObject.init({ value: 'Acme' }).result as OrganizationNameValueObject,
    refreshTokens: [token],
  }).result as SellerAggregate;
}

describe('SellerLogoutService', () => {
  it('should clear all refresh tokens on logout', async () => {
    const seller = buildSellerWithToken();
    expect(seller.refreshTokens).toHaveLength(1);

    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(seller),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SellerLogoutService(repo);

    const result = await service.execute({ sellerId: seller.id.value });
    expect(result.isSuccess).toBe(true);
    expect(seller.refreshTokens).toHaveLength(0);
    expect(repo.save).toHaveBeenCalledWith(seller);
  });
});
