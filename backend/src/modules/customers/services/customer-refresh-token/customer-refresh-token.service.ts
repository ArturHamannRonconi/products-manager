import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  Output,
  IError,
  throwFailInternalServer,
} from 'ddd-tool-kit';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CUSTOMER_INVALID_REFRESH_TOKEN } from '../../domain/customer.errors';
import { ICustomerLoginServiceOutput } from '../customer-login/customer-login.service';
import * as bcryptjs from 'bcryptjs';

interface ICustomerRefreshTokenServiceInput {
  refreshToken: string;
}

@Injectable()
class CustomerRefreshTokenService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: ICustomerRefreshTokenServiceInput,
  ): Promise<Output<ICustomerLoginServiceOutput> | Output<IError>> {
    try {
      const customer = await this.customerRepository.findByRefreshToken(
        input.refreshToken,
      );
      if (!customer) return Output.fail(CUSTOMER_INVALID_REFRESH_TOKEN);

      const tokenEntity = customer.refreshTokens.find((t) =>
        bcryptjs.compareSync(input.refreshToken, t.id.value),
      );
      if (!tokenEntity) return Output.fail(CUSTOMER_INVALID_REFRESH_TOKEN);

      if (tokenEntity.secondsUntilExpiration === 0) {
        return Output.fail(CUSTOMER_INVALID_REFRESH_TOKEN);
      }

      tokenEntity.renew();
      const newRawToken = tokenEntity.id.value;

      await this.customerRepository.save(customer);

      const accessTokenExpirationDate = new Date(Date.now() + 15 * 60 * 1000);
      const accessToken = this.jwtService.sign(
        { sub: customer.id.value, type: 'customer' },
        { expiresIn: '15m' },
      );

      return Output.success({
        id: customer.id.value,
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

export { CustomerRefreshTokenService, ICustomerRefreshTokenServiceInput };
