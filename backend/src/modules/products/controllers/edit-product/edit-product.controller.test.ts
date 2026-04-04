import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { EditProductController } from './edit-product.controller';
import { EditProductService } from '../../services/edit-product/edit-product.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';

const mockView = {
  id: 'p1', name: 'Updated Product', description: 'Desc', image_url: null,
  price: 20, seller_name: 'Seller', seller_id: 's1',
  category_name: 'Electronics', category_id: 'c1', inventory_ammount: 5,
};

describe('EditProductController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditProductController],
      providers: [{ provide: EditProductService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('PUT /product/:id → 200 on success', async () => {
    mockService.execute.mockResolvedValue(Output.success(mockView));

    const res = await request(app.getHttpServer())
      .put('/product/p1')
      .send({ name: 'Updated Product', price: 20 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Product');
  });

  it('PUT /product/:id → 404 when product not found', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Product not found.', statusCode: 404 }),
    );

    const res = await request(app.getHttpServer())
      .put('/product/non-existent')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});
