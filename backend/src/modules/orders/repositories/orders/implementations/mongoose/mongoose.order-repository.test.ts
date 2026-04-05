import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { MongooseOrderRepository } from './mongoose.order-repository';
import { OrderSchema, IOrderSchema } from '../../schema/order.schema';
import { OrderItemMapper } from '../../order-item.mapper';
import { OrderMapper } from '../../order.mapper';
import { OrderAggregate } from '../../../../domain/order.aggregate-root';
import { OrderStatusValueObject } from '../../../../domain/value-objects/order-status/order-status.value-object';
import { OrderItemEntity } from '../../../../domain/entities/order-item/order-item.entity';
import { AmountValueObject } from '../../../../domain/value-objects/amount/amount.value-object';

const CUSTOMER_A_ID = 'customerAAAAAAAA';  // exactly 16 chars
const CUSTOMER_B_ID = 'customerBBBBBBBB';  // exactly 16 chars

function buildOrder(customerId = CUSTOMER_A_ID): OrderAggregate {
  const item = OrderItemEntity.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    productId: IdValueObject.getDefault(),
    ammount: AmountValueObject.init({ value: 2 }).result as AmountValueObject,
  }).result as OrderItemEntity;

  return OrderAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    status: OrderStatusValueObject.init({ value: 'pending' }).result as OrderStatusValueObject,
    customerId: IdValueObject.init({ value: customerId }).result as IdValueObject,
    products: [item],
  }).result as OrderAggregate;
}

describe('MongooseOrderRepository', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongooseOrderRepository;
  let model: Model<IOrderSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
      ],
      providers: [
        OrderItemMapper,
        OrderMapper,
        {
          provide: MongooseOrderRepository,
          useFactory: (orderModel: Model<IOrderSchema>, orderMapper: OrderMapper) =>
            new MongooseOrderRepository(orderModel, orderMapper),
          inject: [getModelToken('Order'), OrderMapper],
        },
      ],
    }).compile();

    repository = module.get(MongooseOrderRepository);
    model = module.get<Model<IOrderSchema>>(getModelToken('Order'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await model.deleteMany({});
  });

  describe('save / findById', () => {
    it('should insert a new order', async () => {
      const order = buildOrder();
      await repository.save(order);
      const found = await repository.findById(order.id);
      expect(found).not.toBeNull();
      expect(found!.id.value).toBe(order.id.value);
    });

    it('should update an existing order', async () => {
      const order = buildOrder();
      await repository.save(order);
      const newStatus = OrderStatusValueObject.init({ value: 'processing' }).result as OrderStatusValueObject;
      order.changeStatus(newStatus);
      await repository.save(order);
      const found = await repository.findById(order.id);
      expect(found!.status.value).toBe('processing');
    });

    it('should return null when order not found', async () => {
      const id = IdValueObject.getDefault();
      const found = await repository.findById(id);
      expect(found).toBeNull();
    });
  });

  describe('findByCustomerId', () => {
    it('should return orders for a customer', async () => {
      const o1 = buildOrder(CUSTOMER_A_ID);
      const o2 = buildOrder(CUSTOMER_A_ID);
      const o3 = buildOrder(CUSTOMER_B_ID);
      await repository.save(o1);
      await repository.save(o2);
      await repository.save(o3);

      const customerId = IdValueObject.init({ value: CUSTOMER_A_ID }).result as IdValueObject;
      const result = await repository.findByCustomerId(customerId, { page: 1, size: 10 });
      expect(result.total).toBe(2);
      expect(result.orders).toHaveLength(2);
    });

    it('should paginate correctly', async () => {
      const o1 = buildOrder(CUSTOMER_A_ID);
      const o2 = buildOrder(CUSTOMER_A_ID);
      await repository.save(o1);
      await repository.save(o2);

      const customerId = IdValueObject.init({ value: CUSTOMER_A_ID }).result as IdValueObject;
      const result = await repository.findByCustomerId(customerId, { page: 1, size: 1 });
      expect(result.orders).toHaveLength(1);
    });

    it('should cap page to last page when page exceeds total', async () => {
      const o1 = buildOrder(CUSTOMER_A_ID);
      await repository.save(o1);

      const customerId = IdValueObject.init({ value: CUSTOMER_A_ID }).result as IdValueObject;
      const result = await repository.findByCustomerId(customerId, { page: 999, size: 10 });
      expect(result.orders).toHaveLength(1);
    });
  });
});
