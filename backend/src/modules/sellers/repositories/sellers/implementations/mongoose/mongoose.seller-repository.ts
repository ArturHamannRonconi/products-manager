import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdValueObject } from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';
import { SellerRepository } from '../../seller-repository.interface';
import { ISellerSchema } from '../../schema/seller.schema';
import { SellerAggregate } from '../../../../domain/seller.aggregate-root';
import { EmailValueObject } from '../../../../domain/value-objects/email/email.value-object';
import { SellerMapper } from '../../seller.mapper';

@Injectable()
class MongooseSellerRepository implements SellerRepository {
  constructor(
    @InjectModel('Seller') private readonly SellerModel: Model<ISellerSchema>,
    private readonly sellerMapper: SellerMapper,
  ) {}

  async findById(id: IdValueObject): Promise<SellerAggregate | null> {
    const schema = await this.SellerModel.findOne({ id: id.value }).lean();
    if (!schema) return null;
    return this.sellerMapper.toRightSide(schema as ISellerSchema);
  }

  async findByEmail(email: EmailValueObject): Promise<SellerAggregate | null> {
    const schema = await this.SellerModel.findOne({
      email: email.value,
    }).lean();
    if (!schema) return null;
    return this.sellerMapper.toRightSide(schema as ISellerSchema);
  }

  async findByRefreshToken(rawToken: string): Promise<SellerAggregate | null> {
    const all = await this.SellerModel.find().lean();
    for (const schema of all) {
      for (const rt of schema.refresh_tokens) {
        if (bcryptjs.compareSync(rawToken, rt.id)) {
          return this.sellerMapper.toRightSide(schema as ISellerSchema);
        }
      }
    }
    return null;
  }

  async save(seller: SellerAggregate): Promise<void> {
    const alreadyExists = await this.SellerModel.exists({
      id: seller.id.value,
    });
    const schema = this.sellerMapper.toLeftSide(seller);

    if (!alreadyExists) {
      await this.SellerModel.insertOne(schema);
    } else {
      schema.updated_at = new Date();
      await this.SellerModel.replaceOne({ id: schema.id }, schema);
    }
  }
}

export { MongooseSellerRepository };
