import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { UpdateOrderStatusController } from './update-order-status.controller';
import { UpdateOrderStatusService } from '../../services/update-order-status/update-order-status.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';

describe('UpdateOrderStatusController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateOrderStatusController],
      providers: [{ provide: UpdateOrderStatusService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: (ctx: any) => { ctx.switchToHttp().getRequest().user = { sellerId: 'seller-1' }; return true; } })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('PATCH /orders/:id/status → 200 on success', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        id: 'o1',
        status: 'processing',
        total_price: 50,
        products: [],
      }),
    );

    const res = await request(app.getHttpServer())
      .patch('/orders/o1/status')
      .send({ status: 'processing' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processing');
  });

  it('PATCH /orders/:id/status → 400 on invalid status transition', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Invalid status transition.', statusCode: 400 }),
    );

    const res = await request(app.getHttpServer())
      .patch('/orders/o1/status')
      .send({ status: 'delivered' });

    expect(res.status).toBe(400);
  });

  it('PATCH /orders/:id/status → 403 on ownership failure', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'You do not have permission to update this order.', statusCode: 403 }),
    );

    const res = await request(app.getHttpServer())
      .patch('/orders/o1/status')
      .send({ status: 'processing' });

    expect(res.status).toBe(403);
  });

  it('PATCH /orders/:id/status → 404 on order not found', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Order not found.', statusCode: 404 }),
    );

    const res = await request(app.getHttpServer())
      .patch('/orders/nonexistent/status')
      .send({ status: 'processing' });

    expect(res.status).toBe(404);
  });
});
