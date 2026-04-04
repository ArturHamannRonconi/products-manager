import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ProductSchema, IProductSchema } from './repositories/products/schema/product.schema';
import { ProductMapper } from './repositories/products/product.mapper';
import { MongooseProductRepository } from './repositories/products/implementations/mongoose/mongoose.product-repository';

import { CategoryModule } from '../categories/category.module';
import { SellersModule } from '../sellers/seller.module';
import { FileProviderModule } from '../../providers/file/file-provider.module';
import { FILE_PROVIDER } from '../../providers/file/file.interface';

import { CreateBatchProductsService } from './services/create-batch-products/create-batch-products.service';
import { UploadProductImageService } from './services/upload-product-image/upload-product-image.service';
import { EditProductService } from './services/edit-product/edit-product.service';
import { DeleteProductService } from './services/delete-product/delete-product.service';
import { GetProductsForSellersService } from './services/get-products-for-sellers/get-products-for-sellers.service';
import { GetProductsForCustomersService } from './services/get-products-for-customers/get-products-for-customers.service';

import { CreateBatchProductsController } from './controllers/create-batch-products/create-batch-products.controller';
import { UploadProductImageController } from './controllers/upload-product-image/upload-product-image.controller';
import { EditProductController } from './controllers/edit-product/edit-product.controller';
import { DeleteProductController } from './controllers/delete-product/delete-product.controller';
import { GetProductsForSellersController } from './controllers/get-products-for-sellers/get-products-for-sellers.controller';
import { GetProductsForCustomersController } from './controllers/get-products-for-customers/get-products-for-customers.controller';

import { MongooseCategoryRepository } from '../categories/repositories/categories/implementations/mongoose/mongoose.category-repository';
import { MongooseSellerRepository } from '../sellers/repositories/sellers/implementations/mongoose/mongoose.seller-repository';
import { IFileProvider } from '../../providers/file/file.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    CategoryModule,
    SellersModule,
    FileProviderModule,
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
  ],
  providers: [
    ProductMapper,
    {
      provide: MongooseProductRepository,
      useFactory: (productModel: Model<IProductSchema>, productMapper: ProductMapper) =>
        new MongooseProductRepository(productModel, productMapper),
      inject: [getModelToken('Product'), ProductMapper],
    },
    {
      provide: CreateBatchProductsService,
      useFactory: (
        productRepo: MongooseProductRepository,
        categoryRepo: MongooseCategoryRepository,
      ) => new CreateBatchProductsService(productRepo, categoryRepo),
      inject: [MongooseProductRepository, MongooseCategoryRepository],
    },
    {
      provide: UploadProductImageService,
      useFactory: (
        productRepo: MongooseProductRepository,
        fileProvider: IFileProvider,
      ) => new UploadProductImageService(productRepo, fileProvider),
      inject: [MongooseProductRepository, FILE_PROVIDER],
    },
    {
      provide: EditProductService,
      useFactory: (
        productRepo: MongooseProductRepository,
        categoryRepo: MongooseCategoryRepository,
        sellerRepo: MongooseSellerRepository,
      ) => new EditProductService(productRepo, categoryRepo, sellerRepo),
      inject: [MongooseProductRepository, MongooseCategoryRepository, MongooseSellerRepository],
    },
    {
      provide: DeleteProductService,
      useFactory: (
        productRepo: MongooseProductRepository,
        categoryRepo: MongooseCategoryRepository,
      ) => new DeleteProductService(productRepo, categoryRepo),
      inject: [MongooseProductRepository, MongooseCategoryRepository],
    },
    {
      provide: GetProductsForSellersService,
      useFactory: (productRepo: MongooseProductRepository) =>
        new GetProductsForSellersService(productRepo),
      inject: [MongooseProductRepository],
    },
    {
      provide: GetProductsForCustomersService,
      useFactory: (productRepo: MongooseProductRepository) =>
        new GetProductsForCustomersService(productRepo),
      inject: [MongooseProductRepository],
    },
  ],
  controllers: [
    CreateBatchProductsController,
    UploadProductImageController,
    EditProductController,
    DeleteProductController,
    GetProductsForSellersController,
    GetProductsForCustomersController,
  ],
  exports: [MongooseProductRepository],
})
export class ProductsModule {}
