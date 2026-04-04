import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeSellerEmailController } from './change-seller-email.controller';
import { ChangeSellerEmailService } from '../../services/change-seller-email/change-seller-email.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('ChangeSellerEmailController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeSellerEmailController],
      providers: [{ provide: ChangeSellerEmailService, useValue: mockService }],
    })
      .overrideGuard(SellerJwtGuard)
      .useValue({ canActivate: (ctx: any) => {
        ctx.switchToHttp().getRequest().user = { sellerId: 'id' };
        return true;
      }})
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('PATCH /seller/email → 204', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));
    const response = await request(app.getHttpServer())
      .patch('/seller/email')
      .set('Authorization', 'Bearer valid.token')
      .send({ email: 'new@example.com' });
    expect(response.status).toBe(204);
  });
});
