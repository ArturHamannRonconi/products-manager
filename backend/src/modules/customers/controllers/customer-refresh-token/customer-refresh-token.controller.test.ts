import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { CustomerRefreshTokenController } from './customer-refresh-token.controller';
import { CustomerRefreshTokenService } from '../../services/customer-refresh-token/customer-refresh-token.service';
import { Output } from 'ddd-tool-kit';

describe('CustomerRefreshTokenController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerRefreshTokenController],
      providers: [{ provide: CustomerRefreshTokenService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /customer/refresh-token → 200 on valid cookie', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        id: 'uuid-1',
        access_token: 'new.jwt.token',
        access_token_expiration_date: new Date(),
        refresh_token_expiration_date: new Date(),
        refresh_token: 'new-raw-token',
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/customer/refresh-token')
      .set('Cookie', 'refresh_token=some-valid-token');

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBe('new.jwt.token');
  });

  it('POST /customer/refresh-token → 403 on invalid token', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Invalid refresh token!', statusCode: 403 }),
    );

    const response = await request(app.getHttpServer())
      .post('/customer/refresh-token')
      .set('Cookie', 'refresh_token=invalid-token');

    expect(response.status).toBe(403);
  });
});
