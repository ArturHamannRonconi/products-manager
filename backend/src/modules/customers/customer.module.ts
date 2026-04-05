import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvProviderModule } from '../../providers/env/env-provider.module';
import { ENV_PROVIDER, IEnvProvider } from '../../providers/env/env-provider.interface';

import { CustomerSchema, ICustomerSchema } from './repositories/customers/schema/customer.schema';
import { RefreshTokenMapper } from './repositories/customers/refresh-token.mapper';
import { CustomerMapper } from './repositories/customers/customer.mapper';
import { MongooseCustomerRepository } from './repositories/customers/implementations/mongoose/mongoose.customer-repository';

import { CustomerJwtStrategy } from './auth/customer-jwt.strategy';
import { CustomerJwtGuard } from './auth/customer-jwt.guard';

import { CreateBatchCustomersService } from './services/create-batch-customers/create-batch-customers.service';
import { CustomerLoginService } from './services/customer-login/customer-login.service';
import { CustomerRefreshTokenService } from './services/customer-refresh-token/customer-refresh-token.service';
import { CustomerLogoutService } from './services/customer-logout/customer-logout.service';
import { GetCustomerInfoService } from './services/get-customer-info/get-customer-info.service';
import { ChangeCustomerNameService } from './services/change-customer-name/change-customer-name.service';
import { ChangeCustomerEmailService } from './services/change-customer-email/change-customer-email.service';
import { ChangeCustomerPasswordService } from './services/change-customer-password/change-customer-password.service';

import { CreateBatchCustomersController } from './controllers/create-batch-customers/create-batch-customers.controller';
import { CustomerLoginController } from './controllers/customer-login/customer-login.controller';
import { CustomerRefreshTokenController } from './controllers/customer-refresh-token/customer-refresh-token.controller';
import { CustomerLogoutController } from './controllers/customer-logout/customer-logout.controller';
import { GetCustomerInfoController } from './controllers/get-customer-info/get-customer-info.controller';
import { ChangeCustomerNameController } from './controllers/change-customer-name/change-customer-name.controller';
import { ChangeCustomerEmailController } from './controllers/change-customer-email/change-customer-email.controller';
import { ChangeCustomerPasswordController } from './controllers/change-customer-password/change-customer-password.controller';

@Module({
  imports: [
    EnvProviderModule,
    MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
    JwtModule.registerAsync({
      imports: [EnvProviderModule],
      useFactory: async (envProvider: IEnvProvider) => ({
        secret: await envProvider.get('JWT_CUSTOMER_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ENV_PROVIDER],
    }),
    PassportModule,
  ],
  providers: [
    {
      provide: CustomerJwtStrategy,
      useFactory: async (envProvider: IEnvProvider) => {
        const secret = await envProvider.get('JWT_CUSTOMER_SECRET');
        return new CustomerJwtStrategy(secret!);
      },
      inject: [ENV_PROVIDER],
    },
    CustomerJwtGuard,
    RefreshTokenMapper,
    CustomerMapper,
    MongooseCustomerRepository,
    {
      provide: CreateBatchCustomersService,
      useFactory: (repo: MongooseCustomerRepository) =>
        new CreateBatchCustomersService(repo),
      inject: [MongooseCustomerRepository],
    },
    {
      provide: CustomerLoginService,
      useFactory: (repo: MongooseCustomerRepository, jwt: JwtService) =>
        new CustomerLoginService(repo, jwt),
      inject: [MongooseCustomerRepository, JwtService],
    },
    {
      provide: CustomerRefreshTokenService,
      useFactory: (repo: MongooseCustomerRepository, jwt: JwtService) =>
        new CustomerRefreshTokenService(repo, jwt),
      inject: [MongooseCustomerRepository, JwtService],
    },
    {
      provide: CustomerLogoutService,
      useFactory: (repo: MongooseCustomerRepository) =>
        new CustomerLogoutService(repo),
      inject: [MongooseCustomerRepository],
    },
    {
      provide: GetCustomerInfoService,
      useFactory: (repo: MongooseCustomerRepository) =>
        new GetCustomerInfoService(repo),
      inject: [MongooseCustomerRepository],
    },
    {
      provide: ChangeCustomerNameService,
      useFactory: (repo: MongooseCustomerRepository) =>
        new ChangeCustomerNameService(repo),
      inject: [MongooseCustomerRepository],
    },
    {
      provide: ChangeCustomerEmailService,
      useFactory: (repo: MongooseCustomerRepository) =>
        new ChangeCustomerEmailService(repo),
      inject: [MongooseCustomerRepository],
    },
    {
      provide: ChangeCustomerPasswordService,
      useFactory: (repo: MongooseCustomerRepository) =>
        new ChangeCustomerPasswordService(repo),
      inject: [MongooseCustomerRepository],
    },
  ],
  controllers: [
    CreateBatchCustomersController,
    CustomerLoginController,
    CustomerRefreshTokenController,
    CustomerLogoutController,
    GetCustomerInfoController,
    ChangeCustomerNameController,
    ChangeCustomerEmailController,
    ChangeCustomerPasswordController,
  ],
  exports: [MongooseCustomerRepository, CustomerJwtGuard, CustomerJwtStrategy],
})
export class CustomersModule {}
