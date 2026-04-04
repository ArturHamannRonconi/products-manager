import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdValueObject } from 'ddd-tool-kit';
import { OrderRepository } from '../../order-repository.interface';
import { IOrderSchema } from '../../schema/order.schema';
import { OrderAggregate } from '../../../../domain/order.aggregate-root';
import { OrderMapper } from '../../order.mapper';

@Injectable()
class MongooseOrderRepository implements OrderRepository {
  constructor(
    @InjectModel('Order') private readonly OrderModel: Model<IOrderSchema>,
    private readonly orderMapper: OrderMapper,
  ) {}

  async findById(id: IdValueObject): Promise<OrderAggregate | null> {
    const schema = await this.OrderModel.findOne({ id: id.value }).lean();
    if (!schema) return null;
    return this.orderMapper.toRightSide(schema as IOrderSchema);
  }

  async findByCustomerId(
    customerId: IdValueObject,
    params: { page: number; size: number },
  ): Promise<{ orders: OrderAggregate[]; total: number }> {
    const { page, size } = params;

    const totalCount = await this.OrderModel.countDocuments({ customer_id: customerId.value });
    const totalPages = Math.ceil(totalCount / size) || 1;
    const effectivePage = Math.min(page, totalPages);
    const skip = (effectivePage - 1) * size;

    const schemas = await this.OrderModel.find({ customer_id: customerId.value })
      .skip(skip)
      .limit(size)
      .lean();

    const orders = schemas.map((s) => this.orderMapper.toRightSide(s as IOrderSchema));

    return { orders, total: totalCount };
  }

  async findBySellerProductIds(
    productIds: string[],
    page: number,
    size: number,
  ): Promise<{ orders: OrderAggregate[]; total: number }> {
    const filter = { 'products.product_id': { $in: productIds } };

    const totalCount = await this.OrderModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / size) || 1;
    const effectivePage = Math.min(page, totalPages);
    const skip = (effectivePage - 1) * size;

    const schemas = await this.OrderModel.find(filter).skip(skip).limit(size).lean();
    const orders = schemas.map((s) => this.orderMapper.toRightSide(s as IOrderSchema));

    return { orders, total: totalCount };
  }

  async save(order: OrderAggregate): Promise<void> {
    const alreadyExists = await this.OrderModel.exists({ id: order.id.value });
    const schema = this.orderMapper.toLeftSide(order);

    if (!alreadyExists) {
      await this.OrderModel.insertOne(schema);
    } else {
      schema.updated_at = new Date();
      await this.OrderModel.replaceOne({ id: schema.id }, schema);
    }
  }
}

export { MongooseOrderRepository };
