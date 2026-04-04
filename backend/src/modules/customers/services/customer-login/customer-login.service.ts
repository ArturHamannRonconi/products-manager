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
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token/refresh-token.entity';
import { CUSTOMER_EMAIL_OR_PASSWORD_INCORRECT } from '../../domain/customer.errors';

interface ICustomerLoginServiceInput {
  email: string;
  password: string;
}

interface ICustomerLoginServiceOutput {
  id: string;
  access_token: string;
  access_token_expiration_date: Date;
  refresh_token_expiration_date: Date;
  refresh_token: string;
}

@Injectable()
class CustomerLoginService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: ICustomerLoginServiceInput,
  ): Promise<Output<ICustomerLoginServiceOutput> | Output<IError>> {
    try {
      const initEmail = EmailValueObject.init({ value: input.email });
      if (initEmail.isFailure) return throwFailOutput(initEmail);

      const customer = await this.customerRepository.findByEmail(
        initEmail.result as EmailValueObject,
      );
      if (!customer) return Output.fail(CUSTOMER_EMAIL_OR_PASSWORD_INCORRECT);

      const isValid = customer.validatePassword(input.password);
      if (!isValid) return Output.fail(CUSTOMER_EMAIL_OR_PASSWORD_INCORRECT);

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

      customer.addRefreshToken(refreshTokenEntity);
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
        refresh_token_expiration_date: expiresAt.value,
        refresh_token: rawRefreshToken,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  CustomerLoginService,
  ICustomerLoginServiceInput,
  ICustomerLoginServiceOutput,
};
