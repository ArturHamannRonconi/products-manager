import { JwtService } from '@nestjs/jwt';
import { SellerRefreshTokenService } from './seller-refresh-token.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token/refresh-token.entity';
import * as bcryptjs from 'bcryptjs';

function buildSellerWithToken() {
  const expiresAt = DateValueObject.getDefault();
  expiresAt.addDays(30);

  const rawTokenId = IdValueObject.getDefault();
  const tokenHash = bcryptjs.hashSync(rawTokenId.value, bcryptjs.genSaltSync());

  const token = RefreshTokenEntity.init({
    id: IdValueObject.init({ value: tokenHash }).result as IdValueObject,
    expiresAt,
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
  }).result as RefreshTokenEntity;

  const seller = SellerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    organizationName: OrganizationNameValueObject.init({ value: 'Acme' }).result as OrganizationNameValueObject,
    refreshTokens: [token],
  }).result as SellerAggregate;

  return { seller, rawTokenId: rawTokenId.value, tokenHash };
}

const mockJwt = { sign: jest.fn().mockReturnValue('new.jwt.token') } as unknown as JwtService;

describe('SellerRefreshTokenService', () => {
  it('should refresh successfully', async () => {
    const { seller, rawTokenId } = buildSellerWithToken();
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(seller),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SellerRefreshTokenService(repo, mockJwt);

    const result = await service.execute({ refreshToken: rawTokenId });
    expect(result.isSuccess).toBe(true);
  });

  it('should fail when token not found', async () => {
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SellerRefreshTokenService(repo, mockJwt);

    const result = await service.execute({ refreshToken: 'invalid-token' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(403);
  });

  it('should fail when token is expired', async () => {
    const expiredAt = DateValueObject.getDefault();
    expiredAt.addDays(-1);

    const rawTokenId = IdValueObject.getDefault();
    const tokenHash = bcryptjs.hashSync(rawTokenId.value, bcryptjs.genSaltSync());

    const token = RefreshTokenEntity.init({
      id: IdValueObject.init({ value: tokenHash }).result as IdValueObject,
      expiresAt: expiredAt,
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
    }).result as RefreshTokenEntity;

    const seller = SellerAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
      email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
      password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
      organizationName: OrganizationNameValueObject.init({ value: 'Acme' }).result as OrganizationNameValueObject,
      refreshTokens: [token],
    }).result as SellerAggregate;

    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(seller),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SellerRefreshTokenService(repo, mockJwt);

    const result = await service.execute({ refreshToken: rawTokenId.value });
    expect(result.isFailure).toBe(true);
  });
});
