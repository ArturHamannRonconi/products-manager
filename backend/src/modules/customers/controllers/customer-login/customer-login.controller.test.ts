import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CustomerLoginController } from './customer-login.controller';
import { CustomerLoginService } from '../../services/customer-login/customer-login.service';
import { Output } from 'ddd-tool-kit';

describe('CustomerLoginController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerLoginController],
      providers: [{ provide: CustomerLoginService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /customer/login → 200 on success', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        id: 'uuid-1',
        access_token: 'jwt.token',
        access_token_expiration_date: new Date(),
        refresh_token_expiration_date: new Date(),
        refresh_token: 'raw-token',
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/customer/login')
      .send({ email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBe('jwt.token');
  });

  it('POST /customer/login → 401 on invalid credentials', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Customer email or password is incorrect!', statusCode: 401 }),
    );

    const response = await request(app.getHttpServer())
      .post('/customer/login')
      .send({ email: 'john@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });
});
