import {
  Controller,
  Get,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/env.config';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { SellersModule } from './modules/sellers/seller.module';
import { CustomersModule } from './modules/customers/customer.module';
import { CategoryModule } from './modules/categories/category.module';
import { FileProviderModule } from './providers/file/file-provider.module';
import { ProductsModule } from './modules/products/product.module';
import { OrdersModule } from './modules/orders/order.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    SellersModule,
    CustomersModule,
    CategoryModule,
    FileProviderModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
