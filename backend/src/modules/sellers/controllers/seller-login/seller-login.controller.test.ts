import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { SellerLoginController } from './seller-login.controller';
import { SellerLoginService } from '../../services/seller-login/seller-login.service';
import { Output } from 'ddd-tool-kit';

describe('SellerLoginController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerLoginController],
      providers: [{ provide: SellerLoginService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /seller/login → 200 and sets cookie', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        id: 'seller-id',
        access_token: 'access.token',
        access_token_expiration_date: new Date(),
        refresh_token_expiration_date: new Date(),
        refresh_token: 'raw-refresh-token',
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/seller/login')
      .send({ email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBe('access.token');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('POST /seller/login → 401 on invalid credentials', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Seller email or password is incorrect!', statusCode: 401 }),
    );

    const response = await request(app.getHttpServer())
      .post('/seller/login')
      .send({ email: 'john@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });
});
