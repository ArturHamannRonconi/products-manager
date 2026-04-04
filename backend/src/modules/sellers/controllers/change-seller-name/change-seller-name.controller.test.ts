import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeSellerNameController } from './change-seller-name.controller';
import { ChangeSellerNameService } from '../../services/change-seller-name/change-seller-name.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('ChangeSellerNameController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeSellerNameController],
      providers: [{ provide: ChangeSellerNameService, useValue: mockService }],
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

  it('PATCH /seller/name → 204', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));
    const response = await request(app.getHttpServer())
      .patch('/seller/name')
      .set('Authorization', 'Bearer valid.token')
      .send({ name: 'New Name' });
    expect(response.status).toBe(204);
  });
});
