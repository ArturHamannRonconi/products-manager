import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { GetOrdersForCustomersController } from './get-orders-for-customers.controller';
import { GetOrdersForCustomersService } from '../../services/get-orders-for-customers/get-orders-for-customers.service';
import { CustomerJwtGuard } from '../../../customers/auth/customer-jwt.guard';

describe('GetOrdersForCustomersController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetOrdersForCustomersController],
      providers: [{ provide: GetOrdersForCustomersService, useValue: mockService }],
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

  it('GET /orders/for-customers → 200 on success', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        orders: [
          {
            id: 'o1',
            status: 'pending',
            total_price: 20,
            products: [],
          },
        ],
        total_orders: 1,
        skipped_orders: 0,
        remaining_orders: 0,
        hasNextPage: false,
      }),
    );

    const res = await request(app.getHttpServer())
      .get('/orders/for-customers')
      .query({ page: 1, size: 10 });

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.hasNextPage).toBe(false);
  });

  it('GET /orders/for-customers → 200 with empty list', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        orders: [],
        total_orders: 0,
        skipped_orders: 0,
        remaining_orders: 0,
        hasNextPage: false,
      }),
    );

    const res = await request(app.getHttpServer()).get('/orders/for-customers');
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0);
  });
});
