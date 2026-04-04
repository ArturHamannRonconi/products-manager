import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { GetProductsForCustomersController } from './get-products-for-customers.controller';
import { GetProductsForCustomersService } from '../../services/get-products-for-customers/get-products-for-customers.service';
import { CustomerJwtGuard } from '../../../customers/auth/customer-jwt.guard';

const mockOutput = {
  products: [{ id: 'p1', name: 'Product', image_url: null, description: 'Desc', price: 10, category: 'Electronics', seller_name: 'Seller' }],
  total_products: 1,
  skipped_products: 0,
  remaining_products: 0,
  hasNextPage: false,
};

describe('GetProductsForCustomersController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetProductsForCustomersController],
      providers: [{ provide: GetProductsForCustomersService, useValue: mockService }],
    })
      .overrideGuard(CustomerJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /products/for-customers → 200 on success', async () => {
    mockService.execute.mockResolvedValue(Output.success(mockOutput));

    const res = await request(app.getHttpServer())
      .get('/products/for-customers?size=10&page=1');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
  });

  it('GET /products/for-customers → 403 when unauthorized', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Invalid access token!', statusCode: 403 }),
    );

    const res = await request(app.getHttpServer())
      .get('/products/for-customers?size=10&page=1');

    expect(res.status).toBe(403);
  });
});
