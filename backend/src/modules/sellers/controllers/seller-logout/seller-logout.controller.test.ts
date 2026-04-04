import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { SellerLogoutController } from './seller-logout.controller';
import { SellerLogoutService } from '../../services/seller-logout/seller-logout.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('SellerLogoutController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerLogoutController],
      providers: [{ provide: SellerLogoutService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: (ctx: any) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { sellerId: 'test-seller-id' };
        return true;
      }})
      .compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /seller/logout → 200', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));

    const response = await request(app.getHttpServer())
      .post('/seller/logout')
      .set('Authorization', 'Bearer valid.token');

    expect(response.status).toBe(200);
  });
});
