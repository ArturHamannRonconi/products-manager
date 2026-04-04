import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdValueObject } from 'ddd-tool-kit';
import { ProductRepository, IProductSellerView, IProductCustomerView } from '../../product-repository.interface';
import { IProductSchema } from '../../schema/product.schema';
import { ProductAggregate } from '../../../../domain/product.aggregate-root';
import { ProductMapper } from '../../product.mapper';

@Injectable()
class MongooseProductRepository implements ProductRepository {
  constructor(
    @InjectModel('Product') private readonly ProductModel: Model<IProductSchema>,
    private readonly productMapper: ProductMapper,
  ) {}

  async findById(id: IdValueObject): Promise<ProductAggregate | null> {
    const schema = await this.ProductModel.findOne({ id: id.value }).lean();
    if (!schema) return null;
    return this.productMapper.toRightSide(schema as IProductSchema);
  }

  async save(product: ProductAggregate): Promise<void> {
    const alreadyExists = await this.ProductModel.exists({ id: product.id.value });
    const schema = this.productMapper.toLeftSide(product);

    if (!alreadyExists) {
      await this.ProductModel.insertOne(schema);
    } else {
      schema.updated_at = new Date();
      await this.ProductModel.replaceOne({ id: schema.id }, schema);
    }
  }

  async findIdsBySellerId(sellerId: string): Promise<string[]> {
    const docs = await this.ProductModel.find({ seller_id: sellerId }, { id: 1, _id: 0 }).lean();
    return docs.map((d) => (d as any).id as string);
  }

  async delete(id: IdValueObject): Promise<void> {
    await this.ProductModel.deleteOne({ id: id.value });
  }

  async countByCategoryId(categoryId: IdValueObject): Promise<number> {
    return this.ProductModel.countDocuments({ category_id: categoryId.value });
  }

  async findForSellers(params: {
    sellerId: string;
    page: number;
    size: number;
    searchByText?: string;
    sortBy: string;
    order: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ products: IProductSellerView[]; total: number }> {
    const { sellerId, page, size, searchByText, sortBy, order, minPrice, maxPrice } = params;
    const sortField = sortBy === 'createdAt' ? 'created_at' : sortBy;

    const matchFilter: any = { seller_id: sellerId };
    if (searchByText) matchFilter.$text = { $search: searchByText };
    if (minPrice !== undefined) matchFilter.price = { ...matchFilter.price, $gte: minPrice };
    if (maxPrice !== undefined) matchFilter.price = { ...matchFilter.price, $lte: maxPrice };

    const totalCount = await this.ProductModel.countDocuments(matchFilter);
    const totalPages = Math.ceil(totalCount / size) || 1;
    const effectivePage = Math.min(page, totalPages);
    const skip = (effectivePage - 1) * size;

    const pipeline: any[] = [
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
      {
        $lookup: {
          from: 'sellers',
          localField: 'seller_id',
          foreignField: 'id',
          as: 'seller_data',
        },
      },
      { $unwind: { path: '$seller_data', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: 'id',
          as: 'category_data',
        },
      },
      { $unwind: { path: '$category_data', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: '$id',
          name: '$name',
          description: '$description',
          image_url: '$image_url',
          price: '$price',
          seller_name: '$seller_data.name',
          seller_id: '$seller_id',
          category_name: '$category_data.name',
          category_id: '$category_id',
          inventory_ammount: '$inventory_ammount',
        },
      },
      { $sort: { [sortField]: order === 'asc' ? 1 : -1 } },
      { $skip: skip },
      { $limit: size },
    ];

    const products = await this.ProductModel.aggregate<IProductSellerView>(pipeline);

    return { products, total: totalCount };
  }

  async findForCustomers(params: {
    page: number;
    size: number;
    searchByText?: string;
    sortBy: string;
    order: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ products: IProductCustomerView[]; total: number }> {
    const { page, size, searchByText, sortBy, order, minPrice, maxPrice } = params;
    const sortField = sortBy === 'createdAt' ? 'created_at' : sortBy;

    const matchFilter: any = {};
    if (searchByText) matchFilter.$text = { $search: searchByText };
    if (minPrice !== undefined) matchFilter.price = { ...matchFilter.price, $gte: minPrice };
    if (maxPrice !== undefined) matchFilter.price = { ...matchFilter.price, $lte: maxPrice };

    const totalCount = await this.ProductModel.countDocuments(matchFilter);
    const totalPages = Math.ceil(totalCount / size) || 1;
    const effectivePage = Math.min(page, totalPages);
    const skip = (effectivePage - 1) * size;

    const pipeline: any[] = [
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
      {
        $lookup: {
          from: 'sellers',
          localField: 'seller_id',
          foreignField: 'id',
          as: 'seller_data',
        },
      },
      { $unwind: { path: '$seller_data', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: 'id',
          as: 'category_data',
        },
      },
      { $unwind: { path: '$category_data', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: '$id',
          name: '$name',
          image_url: '$image_url',
          description: '$description',
          price: '$price',
          category: '$category_data.name',
          seller_name: '$seller_data.name',
          seller_id: '$seller_id',
        },
      },
      { $sort: { [sortField]: order === 'asc' ? 1 : -1 } },
      { $skip: skip },
      { $limit: size },
    ];

    const products = await this.ProductModel.aggregate<IProductCustomerView>(pipeline);

    return { products, total: totalCount };
  }
}

export { MongooseProductRepository };
