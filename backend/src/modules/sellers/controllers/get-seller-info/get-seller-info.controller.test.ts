import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GetSellerInfoController } from './get-seller-info.controller';
import { GetSellerInfoService } from '../../services/get-seller-info/get-seller-info.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('GetSellerInfoController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetSellerInfoController],
      providers: [{ provide: GetSellerInfoService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: (ctx: any) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { sellerId: 'test-seller-id' };
        return true;
      }})
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /seller → 200 with seller info', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        id: 'test-seller-id',
        name: 'John',
        email: 'john@example.com',
        organization_name: 'Acme',
      }),
    );

    const response = await request(app.getHttpServer())
      .get('/seller')
      .set('Authorization', 'Bearer valid.token');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John');
  });
});
