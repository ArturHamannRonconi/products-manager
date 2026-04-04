import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { GetProductsForSellersController } from './get-products-for-sellers.controller';
import { GetProductsForSellersService } from '../../services/get-products-for-sellers/get-products-for-sellers.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';

const mockOutput = {
  products: [{ id: 'p1', name: 'Product', description: 'Desc', image_url: null, price: 10, seller_name: 'Seller', seller_id: 's1', category_name: 'Electronics', category_id: 'c1', inventory_ammount: 5 }],
  total_products: 1,
  skipped_products: 0,
  remaining_products: 0,
  hasNextPage: false,
};

describe('GetProductsForSellersController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetProductsForSellersController],
      providers: [{ provide: GetProductsForSellersService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /products/for-sellers → 200 on success', async () => {
    mockService.execute.mockResolvedValue(Output.success(mockOutput));

    const res = await request(app.getHttpServer())
      .get('/products/for-sellers?size=10&page=1');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.hasNextPage).toBe(false);
  });

  it('GET /products/for-sellers → 403 when unauthorized', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Invalid access token!', statusCode: 403 }),
    );

    const res = await request(app.getHttpServer())
      .get('/products/for-sellers?size=10&page=1');

    expect(res.status).toBe(403);
  });
});
