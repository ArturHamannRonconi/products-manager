import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChangeSellerOrgController } from './change-seller-org.controller';
import { ChangeSellerOrganizationService } from '../../services/change-seller-organization/change-seller-organization.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { Output } from 'ddd-tool-kit';

describe('ChangeSellerOrgController', () => {
  let app: INestApplication;
  const mockService = { execute: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeSellerOrgController],
      providers: [{ provide: ChangeSellerOrganizationService, useValue: mockService }],
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

  it('PATCH /seller/org → 204', async () => {
    mockService.execute.mockResolvedValue(Output.success(undefined));
    const response = await request(app.getHttpServer())
      .patch('/seller/org')
      .set('Authorization', 'Bearer valid.token')
      .send({ name: 'New Corp' });
    expect(response.status).toBe(204);
  });
});
