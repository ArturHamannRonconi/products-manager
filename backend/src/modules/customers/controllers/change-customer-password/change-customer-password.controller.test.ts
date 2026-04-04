import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeCustomerPasswordController } from './change-customer-password.controller';
import { ChangeCustomerPasswordService } from '../../services/change-customer-password/change-customer-password.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('ChangeCustomerPasswordController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeCustomerPasswordController],
      providers: [{ provide: ChangeCustomerPasswordService, useValue: mockService }],
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

  it('PATCH /customer/password → 204', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));
    const response = await request(app.getHttpServer())
      .patch('/customer/password')
      .set('Authorization', 'Bearer valid.token')
      .send({ oldPassword: 'oldpass123', newPassword: 'newpass123' });
    expect(response.status).toBe(204);
  });
});
