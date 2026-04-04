import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CreateBatchSellersController } from './create-batch-sellers.controller';
import { CreateBatchSellersService } from '../../services/create-batch-sellers/create-batch-sellers.service';
import { Output } from 'ddd-tool-kit';

describe('CreateBatchSellersController', () => {
  let app: INestApplication;

  const mockService = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateBatchSellersController],
      providers: [
        { provide: CreateBatchSellersService, useValue: mockService },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /sellers → 201 on success', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        sellers: [{ id: 'uuid-1', name: 'John', email: 'john@example.com', organization_name: 'Acme' }],
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/sellers')
      .send({
        sellers: [
          {
            name: 'John',
            email: 'john@example.com',
            password: 'password123',
            organization_name: 'Acme',
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.sellers).toHaveLength(1);
  });

  it('POST /sellers → 409 on duplicate email', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Seller email already exists!', statusCode: 409 }),
    );

    const response = await request(app.getHttpServer())
      .post('/sellers')
      .send({
        sellers: [
          {
            name: 'John',
            email: 'duplicate@example.com',
            password: 'password123',
            organization_name: 'Acme',
          },
        ],
      });

    expect(response.status).toBe(409);
  });
});
