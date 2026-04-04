import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { MongooseSellerRepository } from './mongoose.seller-repository';
import { SellerSchema, ISellerSchema } from '../../schema/seller.schema';
import { SellerMapper } from '../../seller.mapper';
import { RefreshTokenMapper } from '../../refresh-token.mapper';
import { SellerAggregate } from '../../../../domain/seller.aggregate-root';
import { NameValueObject } from '../../../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../../../shared/value-objects/password/password.value-object';

function buildSeller(email = 'test@example.com'): SellerAggregate {
  return SellerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'Test User' }).result as NameValueObject,
    email: EmailValueObject.init({ value: email }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    organizationName: OrganizationNameValueObject.init({
      value: 'Test Corp',
    }).result as OrganizationNameValueObject,
    refreshTokens: [],
  }).result as SellerAggregate;
}

describe('MongooseSellerRepository', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongooseSellerRepository;
  let model: Model<ISellerSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Seller', schema: SellerSchema }]),
      ],
      providers: [
        RefreshTokenMapper,
        SellerMapper,
        {
          provide: MongooseSellerRepository,
          useFactory: (sellerModel: Model<ISellerSchema>, sellerMapper: SellerMapper) =>
            new MongooseSellerRepository(sellerModel, sellerMapper),
          inject: [getModelToken('Seller'), SellerMapper],
        },
      ],
    }).compile();

    repository = module.get(MongooseSellerRepository);
    model = module.get<Model<ISellerSchema>>(getModelToken('Seller'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await model.deleteMany({});
  });

  it('should insert a new seller', async () => {
    const seller = buildSeller();
    await repository.save(seller);
    const found = await repository.findById(seller.id);
    expect(found).not.toBeNull();
    expect(found!.id.value).toBe(seller.id.value);
  });

  it('should update an existing seller', async () => {
    const seller = buildSeller();
    await repository.save(seller);

    const newName = NameValueObject.init({ value: 'Updated Name' }).result as NameValueObject;
    seller.changeName(newName);
    await repository.save(seller);

    const found = await repository.findById(seller.id);
    expect(found!.name.value).toBe('Updated Name');
  });

  it('should findByEmail', async () => {
    const seller = buildSeller('find@example.com');
    await repository.save(seller);
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
