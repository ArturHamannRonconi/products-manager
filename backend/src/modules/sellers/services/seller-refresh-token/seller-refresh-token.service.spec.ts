import { JwtService } from '@nestjs/jwt';
import { SellerRefreshTokenService } from './seller-refresh-token.service';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { IdValueObject } from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';

function makeExpiredAt(daysFromNow: number) {
  const now = new Date();
  now.setDate(now.getDate() + daysFromNow);
  return { value: now };
}

function buildMockSellerWithToken(expired = false) {
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

  const mockSeller = {
    id: { value: IdValueObject.getDefault().value },
    refreshTokens: [mockToken],
  };

  return { seller: mockSeller as any, rawTokenId };
}

const mockJwt = { sign: jest.fn().mockReturnValue('new.jwt.token') } as unknown as JwtService;

describe('SellerRefreshTokenService', () => {
  it('should refresh successfully', async () => {
    const { seller, rawTokenId } = buildMockSellerWithToken();
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
    const { seller, rawTokenId } = buildMockSellerWithToken(true);
    const repo: SellerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(seller),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SellerRefreshTokenService(repo, mockJwt);

    const result = await service.execute({ refreshToken: rawTokenId });
    expect(result.isFailure).toBe(true);
  });
});
