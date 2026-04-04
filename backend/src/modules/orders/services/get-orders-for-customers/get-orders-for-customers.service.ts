import { Injectable } from '@nestjs/common';
import {
  Output,
  IError,
  throwFailInternalServer,
  IdValueObject,
} from 'ddd-tool-kit';
import { OrderRepository } from '../../repositories/orders/order-repository.interface';
import { ProductRepository } from '../../../products/repositories/products/product-repository.interface';
import { SellerRepository } from '../../../sellers/repositories/sellers/seller-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';

interface IGetOrdersForCustomersServiceInput {
  customerId: string;
  page: number;
  size: number;
}

interface IOrderProductOutput {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  seller_name: string;
  category: string;
}

interface IOrderOutput {
  id: string;
  status: string;
  total_price: number;
  products: IOrderProductOutput[];
}

interface IGetOrdersForCustomersServiceOutput {
  orders: IOrderOutput[];
  total_orders: number;
  skipped_orders: number;
  remaining_orders: number;
  hasNextPage: boolean;
}

@Injectable()
class GetOrdersForCustomersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    input: IGetOrdersForCustomersServiceInput,
  ): Promise<Output<IGetOrdersForCustomersServiceOutput> | Output<IError>> {
    try {
      const customerId = IdValueObject.init({ value: input.customerId }).result as IdValueObject;

      const { orders, total } = await this.orderRepository.findByCustomerId(customerId, {
        page: input.page,
        size: input.size,
      });

      const enrichedOrders: IOrderOutput[] = [];

      for (const order of orders) {
        let total_price = 0;
        const products: IOrderProductOutput[] = [];

        for (const item of order.products) {
          const product = await this.productRepository.findById(item.productId);
          if (!product) continue;

          const seller = await this.sellerRepository.findById(product.sellerId);
          const category = await this.categoryRepository.findById(product.categoryId);

          total_price += product.price.value * item.ammount.value;

          products.push({
            id: product.id.value,
            name: product.name.value,
            description: product.description.value,
            price: product.price.value,
            image_url: product.imageUrl.value,
            seller_name: seller ? seller.name.value : '',
            category: category ? category.name.value : '',
          });
        }

        enrichedOrders.push({
          id: order.id.value,
          status: order.status.value,
          total_price,
          products,
        });
      }

      const skipped = (input.page - 1) * input.size;
      const remaining = Math.max(0, total - skipped - orders.length);

      return Output.success({
        orders: enrichedOrders,
        total_orders: total,
        skipped_orders: skipped,
        remaining_orders: remaining,
        hasNextPage: remaining > 0,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  GetOrdersForCustomersService,
  IGetOrdersForCustomersServiceInput,
  IGetOrdersForCustomersServiceOutput,
};
