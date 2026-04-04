import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { GetCustomerInfoController } from './get-customer-info.controller';
import { GetCustomerInfoService } from '../../services/get-customer-info/get-customer-info.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('GetCustomerInfoController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetCustomerInfoController],
      providers: [{ provide: GetCustomerInfoService, useValue: mockService }],
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

  it('GET /customer → 200 with customer info', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({ id: 'uuid-1', name: 'John', email: 'john@example.com' }),
    );

    const response = await request(app.getHttpServer())
      .get('/customer')
      .set('Authorization', 'Bearer valid.token');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John');
  });
});
