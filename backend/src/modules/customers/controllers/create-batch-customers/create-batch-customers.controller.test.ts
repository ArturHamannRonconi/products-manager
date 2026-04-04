import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CreateBatchCustomersController } from './create-batch-customers.controller';
import { CreateBatchCustomersService } from '../../services/create-batch-customers/create-batch-customers.service';
import { Output } from 'ddd-tool-kit';

describe('CreateBatchCustomersController', () => {
  let app: INestApplication;

  const mockService = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateBatchCustomersController],
      providers: [
        { provide: CreateBatchCustomersService, useValue: mockService },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /customers → 201 on success', async () => {
    mockService.execute.mockResolvedValue(
      Output.success({
        customers: [{ id: 'uuid-1', name: 'John', email: 'john@example.com' }],
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/customers')
      .send({
        customers: [
          { name: 'John', email: 'john@example.com', password: 'password123' },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.customers).toHaveLength(1);
  });

  it('POST /customers → 409 on duplicate email', async () => {
    mockService.execute.mockResolvedValue(
      Output.fail({ message: 'Customer email already exists!', statusCode: 409 }),
    );

    const response = await request(app.getHttpServer())
      .post('/customers')
      .send({
        customers: [
          { name: 'John', email: 'duplicate@example.com', password: 'password123' },
        ],
      });

    expect(response.status).toBe(409);
  });
});
