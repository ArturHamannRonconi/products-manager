import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CustomerLogoutController } from './customer-logout.controller';
import { CustomerLogoutService } from '../../services/customer-logout/customer-logout.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('CustomerLogoutController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerLogoutController],
      providers: [{ provide: CustomerLogoutService, useValue: mockService }],
    })
      .overrideGuard(CustomerJwtGuard)
      .useValue({ canActivate: (ctx: any) => {
        ctx.switchToHttp().getRequest().user = { customerId: 'id' };
        return true;
      }})
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /customer/logout → 200', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));

    const response = await request(app.getHttpServer())
      .post('/customer/logout')
      .set('Authorization', 'Bearer valid.token');

    expect(response.status).toBe(200);
  });
});
