import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { CreateBatchProductsController } from './create-batch-products.controller';
import { CreateBatchProductsService } from '../../services/create-batch-products/create-batch-products.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';

describe('CreateBatchProductsController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateBatchProductsController],
      providers: [{ provide: CreateBatchProductsService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: (ctx: any) => { ctx.switchToHttp().getRequest().user = { sellerId: 'seller-1' }; return true; } })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /products → 201 on success', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({ products: [{ id: 'p1', name: 'Product', description: 'Desc', category: 'Electronics', price: 10, inventory_ammount: 5 }] }),
    );

    const res = await request(app.getHttpServer())
      .post('/products')
      .send({ products: [{ name: 'Product', description: 'Desc', category: 'Electronics', price: 10, inventory_ammount: 5 }] });

    expect(res.status).toBe(201);
    expect(res.body.products).toHaveLength(1);
  });

  it('POST /products → 400 on invalid data', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Invalid product props.', statusCode: 400 }),
    );

    const res = await request(app.getHttpServer())
      .post('/products')
      .send({ products: [{ name: '', description: 'Desc', category: 'Cat', price: 10, inventory_ammount: 5 }] });

    expect(res.status).toBe(400);
  });
});
