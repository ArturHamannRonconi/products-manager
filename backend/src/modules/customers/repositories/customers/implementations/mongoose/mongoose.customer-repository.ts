import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdValueObject } from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';
import { CustomerRepository } from '../../customer-repository.interface';
import { ICustomerSchema } from '../../schema/customer.schema';
import { CustomerAggregate } from '../../../../domain/customer.aggregate-root';
import { EmailValueObject } from '../../../../domain/value-objects/email/email.value-object';
import { CustomerMapper } from '../../customer.mapper';

@Injectable()
class MongooseCustomerRepository implements CustomerRepository {
  constructor(
    @InjectModel('Customer') private readonly CustomerModel: Model<ICustomerSchema>,
    private readonly customerMapper: CustomerMapper,
  ) {}

  async findById(id: IdValueObject): Promise<CustomerAggregate | null> {
    const schema = await this.CustomerModel.findOne({ id: id.value }).lean();
    if (!schema) return null;
    return this.customerMapper.toRightSide(schema as ICustomerSchema);
  }

  async findByEmail(email: EmailValueObject): Promise<CustomerAggregate | null> {
    const schema = await this.CustomerModel.findOne({
      email: email.value,
    }).lean();
    if (!schema) return null;
    return this.customerMapper.toRightSide(schema as ICustomerSchema);
  }

  async findByRefreshToken(rawToken: string): Promise<CustomerAggregate | null> {
    const all = await this.CustomerModel.find().lean();
    for (const schema of all) {
      for (const rt of schema.refresh_tokens) {
        if (bcryptjs.compareSync(rawToken, rt.id)) {
          return this.customerMapper.toRightSide(schema as ICustomerSchema);
        }
      }
    }
    return null;
  }

  async save(customer: CustomerAggregate): Promise<void> {
    const alreadyExists = await this.CustomerModel.exists({
      id: customer.id.value,
    });
    const schema = this.customerMapper.toLeftSide(customer);

    if (!alreadyExists) {
      await this.CustomerModel.insertOne(schema);
    } else {
      schema.updated_at = new Date();
      await this.CustomerModel.replaceOne({ id: schema.id }, schema);
    }
  }
}

export { MongooseCustomerRepository };
