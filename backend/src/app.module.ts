import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { SellersModule } from './modules/sellers/seller.module';
import { CustomersModule } from './modules/customers/customer.module';
import { CategoryModule } from './modules/categories/category.module';
import { FileProviderModule } from './providers/file/file-provider.module';
import { EnvProviderModule } from './providers/env/env-provider.module';
import { ENV_PROVIDER, IEnvProvider } from './providers/env/env-provider.interface';
import { ProductsModule } from './modules/products/product.module';
import { OrdersModule } from './modules/orders/order.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    EnvProviderModule,
    MongooseModule.forRootAsync({
      imports: [EnvProviderModule],
      inject: [ENV_PROVIDER],
      useFactory: async (envProvider: IEnvProvider) => ({
        uri: await envProvider.get('MONGODB_URI'),
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
