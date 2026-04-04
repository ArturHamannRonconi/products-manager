import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeCustomerEmailController } from './change-customer-email.controller';
import { ChangeCustomerEmailService } from '../../services/change-customer-email/change-customer-email.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('ChangeCustomerEmailController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeCustomerEmailController],
      providers: [{ provide: ChangeCustomerEmailService, useValue: mockService }],
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

  it('PATCH /customer/email → 204', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));
    const response = await request(app.getHttpServer())
      .patch('/customer/email')
      .set('Authorization', 'Bearer valid.token')
      .send({ email: 'new@example.com' });
    expect(response.status).toBe(204);
  });
});
