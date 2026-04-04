import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { MongooseCustomerRepository } from './mongoose.customer-repository';
import { CustomerSchema, ICustomerSchema } from '../../schema/customer.schema';
import { CustomerMapper } from '../../customer.mapper';
import { RefreshTokenMapper } from '../../refresh-token.mapper';
import { CustomerAggregate } from '../../../../domain/customer.aggregate-root';
import { NameValueObject } from '../../../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../../../shared/value-objects/password/password.value-object';

function buildCustomer(email = 'test@example.com'): CustomerAggregate {
  return CustomerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'Test User' }).result as NameValueObject,
    email: EmailValueObject.init({ value: email }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    refreshTokens: [],
  }).result as CustomerAggregate;
}

describe('MongooseCustomerRepository', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongooseCustomerRepository;
  let model: Model<ICustomerSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
      ],
      providers: [
        RefreshTokenMapper,
        CustomerMapper,
        {
          provide: MongooseCustomerRepository,
          useFactory: (customerModel: Model<ICustomerSchema>, customerMapper: CustomerMapper) =>
            new MongooseCustomerRepository(customerModel, customerMapper),
          inject: [getModelToken('Customer'), CustomerMapper],
        },
      ],
    }).compile();

    repository = module.get(MongooseCustomerRepository);
    model = module.get<Model<ICustomerSchema>>(getModelToken('Customer'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await model.deleteMany({});
  });

  it('should insert a new customer', async () => {
    const customer = buildCustomer();
    await repository.save(customer);
    const found = await repository.findById(customer.id);
    expect(found).not.toBeNull();
    expect(found!.id.value).toBe(customer.id.value);
  });

  it('should update an existing customer', async () => {
    const customer = buildCustomer();
    await repository.save(customer);

    const newName = NameValueObject.init({ value: 'Updated Name' }).result as NameValueObject;
    customer.changeName(newName);
    await repository.save(customer);

    const found = await repository.findById(customer.id);
    expect(found!.name.value).toBe('Updated Name');
  });

  it('should findByEmail', async () => {
    const customer = buildCustomer('find@example.com');
    await repository.save(customer);
    const email = EmailValueObject.init({ value: 'find@example.com' }).result as EmailValueObject;
    const found = await repository.findByEmail(email);
    expect(found).not.toBeNull();
    expect(found!.email.value).toBe('find@example.com');
  });

  it('should return null when findById not found', async () => {
    const id = IdValueObject.getDefault();
    const found = await repository.findById(id);
    expect(found).toBeNull();
  });
});
