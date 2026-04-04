import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { DeleteProductController } from './delete-product.controller';
import { DeleteProductService } from '../../services/delete-product/delete-product.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';

describe('DeleteProductController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteProductController],
      providers: [{ provide: DeleteProductService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('DELETE /product/:id → 200 on success', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));

    const res = await request(app.getHttpServer()).delete('/product/p1');

    expect(res.status).toBe(200);
  });

  it('DELETE /product/:id → 404 when product not found', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Product not found.', statusCode: 404 }),
    );

    const res = await request(app.getHttpServer()).delete('/product/non-existent');

    expect(res.status).toBe(404);
  });
});
