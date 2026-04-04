import { JwtService } from '@nestjs/jwt';
import { CustomerRefreshTokenService } from './customer-refresh-token.service';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token/refresh-token.entity';
import * as bcryptjs from 'bcryptjs';

function buildCustomerWithToken() {
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

  const customer = CustomerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    refreshTokens: [token],
  }).result as CustomerAggregate;

  return { customer, rawTokenId: rawTokenId.value, tokenHash };
}

const mockJwt = { sign: jest.fn().mockReturnValue('new.jwt.token') } as unknown as JwtService;

describe('CustomerRefreshTokenService', () => {
  it('should refresh token successfully', async () => {
    const { customer, rawTokenId } = buildCustomerWithToken();
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(customer),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new CustomerRefreshTokenService(repo, mockJwt);

    const result = await service.execute({ refreshToken: rawTokenId });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { access_token: string };
    expect(output.access_token).toBe('new.jwt.token');
  });

  it('should fail when refresh token not found', async () => {
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new CustomerRefreshTokenService(repo, mockJwt);

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

    const customer = CustomerAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
      email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
      password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
      refreshTokens: [token],
    }).result as CustomerAggregate;

    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(customer),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new CustomerRefreshTokenService(repo, mockJwt);

    const result = await service.execute({ refreshToken: rawTokenId.value });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(403);
  });
});
