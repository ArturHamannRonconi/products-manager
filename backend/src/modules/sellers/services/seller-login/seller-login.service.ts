import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  Output,
  IError,
  throwFailOutput,
  throwFailInternalServer,
  DateValueObject,
  IdValueObject,
} from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token/refresh-token.entity';
import {
  SELLER_EMAIL_OR_PASSWORD_INCORRECT,
  SELLER_NOT_FOUND,
} from '../../domain/seller.errors';
import { SellerAggregate } from '../../domain/seller.aggregate-root';

interface ISellerLoginServiceInput {
  email: string;
  password: string;
}

interface ISellerLoginServiceOutput {
  id: string;
  access_token: string;
  access_token_expiration_date: Date;
  refresh_token_expiration_date: Date;
  refresh_token: string;
}

@Injectable()
class SellerLoginService {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: ISellerLoginServiceInput,
  ): Promise<Output<ISellerLoginServiceOutput> | Output<IError>> {
    try {
      const initEmail = EmailValueObject.init({ value: input.email });
      if (initEmail.isFailure) return throwFailOutput(initEmail);

      const seller = await this.sellerRepository.findByEmail(
        initEmail.result as EmailValueObject,
      );
      if (!seller) return Output.fail(SELLER_EMAIL_OR_PASSWORD_INCORRECT);

      const isValid = seller.validatePassword(input.password);
      if (!isValid) return Output.fail(SELLER_EMAIL_OR_PASSWORD_INCORRECT);

      const expiresAt = DateValueObject.getDefault();
      expiresAt.addDays(30);

      const initToken = RefreshTokenEntity.init({
        id: IdValueObject.getDefault(),
        expiresAt,
        createdAt: DateValueObject.getDefault(),
        updatedAt: DateValueObject.getDefault(),
      });
      if (initToken.isFailure) return throwFailOutput(initToken);

      const refreshTokenEntity = initToken.result as RefreshTokenEntity;
      const rawRefreshToken = refreshTokenEntity.id.value;

      seller.addRefreshToken(refreshTokenEntity);
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
        refresh_token_expiration_date: expiresAt.value,
        refresh_token: rawRefreshToken,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  SellerLoginService,
  ISellerLoginServiceInput,
  ISellerLoginServiceOutput,
};
