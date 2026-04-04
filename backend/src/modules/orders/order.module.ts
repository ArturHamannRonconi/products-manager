import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OrderSchema, IOrderSchema } from './repositories/orders/schema/order.schema';
import { OrderItemMapper } from './repositories/orders/order-item.mapper';
import { OrderMapper } from './repositories/orders/order.mapper';
import { MongooseOrderRepository } from './repositories/orders/implementations/mongoose/mongoose.order-repository';

import { ProductsModule } from '../products/product.module';
import { SellersModule } from '../sellers/seller.module';
import { CategoryModule } from '../categories/category.module';

import { MongooseProductRepository } from '../products/repositories/products/implementations/mongoose/mongoose.product-repository';
import { MongooseSellerRepository } from '../sellers/repositories/sellers/implementations/mongoose/mongoose.seller-repository';
import { MongooseCategoryRepository } from '../categories/repositories/categories/implementations/mongoose/mongoose.category-repository';

import { CreateBatchOrdersService } from './services/create-batch-orders/create-batch-orders.service';
import { UpdateOrderStatusService } from './services/update-order-status/update-order-status.service';
import { GetOrdersForCustomersService } from './services/get-orders-for-customers/get-orders-for-customers.service';
import { ListOrdersForSellerUseCase } from './services/list-orders-for-seller/list-orders-for-seller.usecase';

import { CreateBatchOrdersController } from './controllers/create-batch-orders/create-batch-orders.controller';
import { UpdateOrderStatusController } from './controllers/update-order-status/update-order-status.controller';
import { GetOrdersForCustomersController } from './controllers/get-orders-for-customers/get-orders-for-customers.controller';
import { ListOrdersForSellerController } from './controllers/list-orders-for-seller/list-orders-for-seller.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    ProductsModule,
    SellersModule,
    CategoryModule,
  ],
  providers: [
    OrderItemMapper,
    OrderMapper,
    {
      provide: MongooseOrderRepository,
      useFactory: (orderModel: Model<IOrderSchema>, orderMapper: OrderMapper) =>
        new MongooseOrderRepository(orderModel, orderMapper),
      inject: [getModelToken('Order'), OrderMapper],
    },
    {
      provide: CreateBatchOrdersService,
      useFactory: (
        orderRepo: MongooseOrderRepository,
        productRepo: MongooseProductRepository,
      ) => new CreateBatchOrdersService(orderRepo, productRepo),
      inject: [MongooseOrderRepository, MongooseProductRepository],
    },
    {
      provide: UpdateOrderStatusService,
      useFactory: (
        orderRepo: MongooseOrderRepository,
        productRepo: MongooseProductRepository,
        sellerRepo: MongooseSellerRepository,
        categoryRepo: MongooseCategoryRepository,
      ) => new UpdateOrderStatusService(orderRepo, productRepo, sellerRepo, categoryRepo),
      inject: [
        MongooseOrderRepository,
        MongooseProductRepository,
        MongooseSellerRepository,
        MongooseCategoryRepository,
      ],
    },
    {
      provide: GetOrdersForCustomersService,
      useFactory: (
        orderRepo: MongooseOrderRepository,
        productRepo: MongooseProductRepository,
        sellerRepo: MongooseSellerRepository,
        categoryRepo: MongooseCategoryRepository,
      ) => new GetOrdersForCustomersService(orderRepo, productRepo, sellerRepo, categoryRepo),
      inject: [
        MongooseOrderRepository,
        MongooseProductRepository,
        MongooseSellerRepository,
        MongooseCategoryRepository,
      ],
    },
    {
      provide: ListOrdersForSellerUseCase,
      useFactory: (
        orderRepo: MongooseOrderRepository,
        productRepo: MongooseProductRepository,
        categoryRepo: MongooseCategoryRepository,
      ) => new ListOrdersForSellerUseCase(orderRepo, productRepo, categoryRepo),
      inject: [
        MongooseOrderRepository,
        MongooseProductRepository,
        MongooseCategoryRepository,
      ],
    },
  ],
  controllers: [
    CreateBatchOrdersController,
    UpdateOrderStatusController,
    GetOrdersForCustomersController,
    ListOrdersForSellerController,
  ],
})
export class OrdersModule {}
