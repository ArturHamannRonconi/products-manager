import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  Output,
  IError,
  throwFailInternalServer,
} from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SELLER_INVALID_REFRESH_TOKEN } from '../../domain/seller.errors';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token/refresh-token.entity';
import { ISellerLoginServiceOutput } from '../seller-login/seller-login.service';
import * as bcryptjs from 'bcryptjs';

interface ISellerRefreshTokenServiceInput {
  refreshToken: string;
}

@Injectable()
class SellerRefreshTokenService {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: ISellerRefreshTokenServiceInput,
  ): Promise<Output<ISellerLoginServiceOutput> | Output<IError>> {
    try {
      const seller = await this.sellerRepository.findByRefreshToken(
        input.refreshToken,
      );
      if (!seller) return Output.fail(SELLER_INVALID_REFRESH_TOKEN);

      const tokenEntity = seller.refreshTokens.find((t) =>
        bcryptjs.compareSync(input.refreshToken, t.id.value),
      );
      if (!tokenEntity) return Output.fail(SELLER_INVALID_REFRESH_TOKEN);

      if (tokenEntity.secondsUntilExpiration === 0) {
        return Output.fail(SELLER_INVALID_REFRESH_TOKEN);
      }

      const rawNewToken = tokenEntity.id.value;
      tokenEntity.renew();
      const newRawToken = tokenEntity.id.value;

      await this.sellerRepository.save(seller);

      const accessTokenExpirationDate = new Date(Date.now() + 15 * 60 * 1000);
      const accessToken = this.jwtService.sign(
        { sub: seller.id.value, type: 'seller' },
        { expiresIn: '15m' },
      );

      return Output.success({
        id: seller.id.value,
        access_token: accessToken,
        access_token_expiration_date: accessTokenExpirationDate,
        refresh_token_expiration_date: tokenEntity.expiresAt.value,
        refresh_token: newRawToken,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { SellerRefreshTokenService, ISellerRefreshTokenServiceInput };
