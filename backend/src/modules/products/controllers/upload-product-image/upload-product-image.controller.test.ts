import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Output } from 'ddd-tool-kit';
import { UploadProductImageController } from './upload-product-image.controller';
import { UploadProductImageService } from '../../services/upload-product-image/upload-product-image.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { MulterModule } from '@nestjs/platform-express';

const mockView = {
  id: 'p1', name: 'Product', description: 'Desc', image_url: 'https://s3.example.com/img.jpg',
  price: 10, seller_name: 'Seller', seller_id: 's1',
  category_name: 'Electronics', category_id: 'c1', inventory_ammount: 5,
};

describe('UploadProductImageController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MulterModule.register()],
      controllers: [UploadProductImageController],
      providers: [{ provide: UploadProductImageService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /product/:id/image → 200 on success', async () => {
    mockService.execute.mockResolvedValue(Output.success(mockView));

    const res = await request(app.getHttpServer())
      .post('/product/p1/image')
      .attach('file', Buffer.from('fake image data'), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body.image_url).toBe('https://s3.example.com/img.jpg');
  });

  it('POST /product/:id/image → 404 when product not found', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Product not found.', statusCode: 404 }),
    );

    const res = await request(app.getHttpServer())
      .post('/product/non-existent/image')
      .attach('file', Buffer.from('fake image data'), 'test.jpg');

    expect(res.status).toBe(404);
  });
});
