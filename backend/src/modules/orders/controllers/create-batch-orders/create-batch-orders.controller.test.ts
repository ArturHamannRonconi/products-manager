import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { CreateBatchOrdersController } from './create-batch-orders.controller';
import { CreateBatchOrdersService } from '../../services/create-batch-orders/create-batch-orders.service';
import { CustomerJwtGuard } from '../../../customers/auth/customer-jwt.guard';

describe('CreateBatchOrdersController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateBatchOrdersController],
      providers: [{ provide: CreateBatchOrdersService, useValue: mockService }],
    })
      .overrideGuard(CustomerJwtGuard)
      .useValue({
        canActivate: (ctx: any) => {
          ctx.switchToHttp().getRequest().user = { customerId: 'customer-1' };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /orders → 201 on success', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        orders: [{ id: 'o1', status: 'pending', products: [{ product_id: 'p1', ammount: 2 }] }],
      }),
    );

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ orders: [{ products: [{ product_id: 'p1', ammount: 2 }] }] });

    expect(res.status).toBe(201);
    expect(res.body.orders).toHaveLength(1);
  });

  it('POST /orders → 400 on insufficient stock', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Insufficient stock for product: Widget', statusCode: 400 }),
    );

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ orders: [{ products: [{ product_id: 'p1', ammount: 100 }] }] });

    expect(res.status).toBe(400);
  });

  it('POST /orders → 400 on product not found', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Product not found.', statusCode: 404 }),
    );

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ orders: [{ products: [{ product_id: 'non-existent', ammount: 1 }] }] });

    expect(res.status).toBe(404);
  });
});
