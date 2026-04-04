import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeCustomerNameController } from './change-customer-name.controller';
import { ChangeCustomerNameService } from '../../services/change-customer-name/change-customer-name.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('ChangeCustomerNameController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeCustomerNameController],
      providers: [{ provide: ChangeCustomerNameService, useValue: mockService }],
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

  it('PATCH /customer/name → 204', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));
    const response = await request(app.getHttpServer())
      .patch('/customer/name')
      .set('Authorization', 'Bearer valid.token')
      .send({ name: 'Jane Doe' });
    expect(response.status).toBe(204);
  });
});
