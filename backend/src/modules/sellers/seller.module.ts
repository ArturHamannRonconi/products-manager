import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SellerSchema, ISellerSchema } from './repositories/sellers/schema/seller.schema';
import { RefreshTokenMapper } from './repositories/sellers/refresh-token.mapper';
import { SellerMapper } from './repositories/sellers/seller.mapper';
import { MongooseSellerRepository } from './repositories/sellers/implementations/mongoose/mongoose.seller-repository';

import { SellerJwtStrategy } from './auth/seller-jwt.strategy';
import { SellerJwtGuard } from './auth/seller-jwt.guard';

import { CreateBatchSellersService } from './services/create-batch-sellers/create-batch-sellers.service';
import { SellerLoginService } from './services/seller-login/seller-login.service';
import { SellerRefreshTokenService } from './services/seller-refresh-token/seller-refresh-token.service';
import { SellerLogoutService } from './services/seller-logout/seller-logout.service';
import { GetSellerInfoService } from './services/get-seller-info/get-seller-info.service';
import { ChangeSellerNameService } from './services/change-seller-name/change-seller-name.service';
import { ChangeSellerOrganizationService } from './services/change-seller-organization/change-seller-organization.service';
import { ChangeSellerEmailService } from './services/change-seller-email/change-seller-email.service';
import { ChangeSellerPasswordService } from './services/change-seller-password/change-seller-password.service';

import { CreateBatchSellersController } from './controllers/create-batch-sellers/create-batch-sellers.controller';
import { SellerLoginController } from './controllers/seller-login/seller-login.controller';
import { SellerRefreshTokenController } from './controllers/seller-refresh-token/seller-refresh-token.controller';
import { SellerLogoutController } from './controllers/seller-logout/seller-logout.controller';
import { GetSellerInfoController } from './controllers/get-seller-info/get-seller-info.controller';
import { ChangeSellerNameController } from './controllers/change-seller-name/change-seller-name.controller';
import { ChangeSellerOrgController } from './controllers/change-seller-org/change-seller-org.controller';
import { ChangeSellerEmailController } from './controllers/change-seller-email/change-seller-email.controller';
import { ChangeSellerPasswordController } from './controllers/change-seller-password/change-seller-password.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Seller', schema: SellerSchema }]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SELLER_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [
    SellerJwtStrategy,
    SellerJwtGuard,
    RefreshTokenMapper,
    SellerMapper,
    MongooseSellerRepository,
    {
      provide: CreateBatchSellersService,
      useFactory: (repo: MongooseSellerRepository) =>
        new CreateBatchSellersService(repo),
      inject: [MongooseSellerRepository],
    },
    {
      provide: SellerLoginService,
      useFactory: (repo: MongooseSellerRepository, jwt: JwtService) =>
        new SellerLoginService(repo, jwt),
      inject: [MongooseSellerRepository, JwtService],
    },
    {
      provide: SellerRefreshTokenService,
      useFactory: (repo: MongooseSellerRepository, jwt: JwtService) =>
        new SellerRefreshTokenService(repo, jwt),
      inject: [MongooseSellerRepository, JwtService],
    },
    {
      provide: SellerLogoutService,
      useFactory: (repo: MongooseSellerRepository) =>
        new SellerLogoutService(repo),
      inject: [MongooseSellerRepository],
    },
    {
      provide: GetSellerInfoService,
      useFactory: (repo: MongooseSellerRepository) =>
        new GetSellerInfoService(repo),
      inject: [MongooseSellerRepository],
    },
    {
      provide: ChangeSellerNameService,
      useFactory: (repo: MongooseSellerRepository) =>
        new ChangeSellerNameService(repo),
      inject: [MongooseSellerRepository],
    },
    {
      provide: ChangeSellerOrganizationService,
      useFactory: (repo: MongooseSellerRepository) =>
        new ChangeSellerOrganizationService(repo),
      inject: [MongooseSellerRepository],
    },
    {
      provide: ChangeSellerEmailService,
      useFactory: (repo: MongooseSellerRepository) =>
        new ChangeSellerEmailService(repo),
      inject: [MongooseSellerRepository],
    },
    {
      provide: ChangeSellerPasswordService,
      useFactory: (repo: MongooseSellerRepository) =>
        new ChangeSellerPasswordService(repo),
      inject: [MongooseSellerRepository],
    },
  ],
  controllers: [
    CreateBatchSellersController,
    SellerLoginController,
    SellerRefreshTokenController,
    SellerLogoutController,
    GetSellerInfoController,
    ChangeSellerNameController,
    ChangeSellerOrgController,
    ChangeSellerEmailController,
    ChangeSellerPasswordController,
  ],
  exports: [MongooseSellerRepository],
})
export class SellersModule {}
