import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { SellerRefreshTokenController } from './seller-refresh-token.controller';
import { SellerRefreshTokenService } from '../../services/seller-refresh-token/seller-refresh-token.service';
import { Output } from 'ddd-tool-kit';

describe('SellerRefreshTokenController', () => {
  let app: INestApplication;

  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerRefreshTokenController],
      providers: [
        { provide: SellerRefreshTokenService, useValue: mockService },
      ],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /seller/refresh-token → 200 on valid cookie', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        id: 'seller-id',
        access_token: 'new.token',
        access_token_expiration_date: new Date(),
        refresh_token_expiration_date: new Date(),
        refresh_token: 'new-raw-token',
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/seller/refresh-token')
      .set('Cookie', 'refresh_token=some-raw-token');

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBe('new.token');
  });

  it('POST /seller/refresh-token → 403 on invalid token', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Invalid refresh token!', statusCode: 403 }),
    );

    const response = await request(app.getHttpServer())
      .post('/seller/refresh-token')
      .set('Cookie', 'refresh_token=invalid');

    expect(response.status).toBe(403);
  });
});
