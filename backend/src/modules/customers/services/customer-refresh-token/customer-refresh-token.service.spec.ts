import { JwtService } from '@nestjs/jwt';
import { CustomerRefreshTokenService } from './customer-refresh-token.service';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';

function makeExpiredAt(daysFromNow: number) {
  const d = DateValueObject.getDefault();
  d.addDays(daysFromNow);
  return d;
}

function buildMockCustomerWithToken(expired = false) {
  const rawTokenId = IdValueObject.getDefault().value;
  const tokenHash = bcryptjs.hashSync(rawTokenId, bcryptjs.genSaltSync());

  const mockToken = {
    id: { value: tokenHash },
    expiresAt: makeExpiredAt(expired ? -1 : 30),
    get secondsUntilExpiration() {
      const diff = Math.floor((this.expiresAt.value.getTime() - Date.now()) / 1000);
      return Math.max(diff, 0);
    },
    renew: jest.fn(function (this: any) {
      this.id = { value: IdValueObject.getDefault().value };
    }),
  };

  const mockCustomer = {
    id: { value: IdValueObject.getDefault().value },
    refreshTokens: [mockToken],
  };

  return { customer: mockCustomer as any, rawTokenId };
}

const mockJwt = { sign: jest.fn().mockReturnValue('new.jwt.token') } as unknown as JwtService;

describe('CustomerRefreshTokenService', () => {
  it('should refresh token successfully', async () => {
    const { customer, rawTokenId } = buildMockCustomerWithToken();
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
    const { customer, rawTokenId } = buildMockCustomerWithToken(true);
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(customer),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new CustomerRefreshTokenService(repo, mockJwt);

    const result = await service.execute({ refreshToken: rawTokenId });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(403);
  });
});
