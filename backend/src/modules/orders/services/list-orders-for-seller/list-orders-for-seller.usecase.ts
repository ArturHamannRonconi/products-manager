import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailInternalServer } from 'ddd-tool-kit';
import { OrderRepository } from '../../repositories/orders/order-repository.interface';
import { ProductRepository } from '../../../products/repositories/products/product-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { IListOrdersForSellerServiceInput } from './list-orders-for-seller.input';
import {
  IOrderForSellerItem,
  IOrderProductForSellerOutput,
  IListOrdersForSellerServiceOutput,
} from './list-orders-for-seller.output';

@Injectable()
class ListOrdersForSellerUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    input: IListOrdersForSellerServiceInput,
  ): Promise<Output<IListOrdersForSellerServiceOutput> | Output<IError>> {
    try {
      const productIds = await this.productRepository.findIdsBySellerId(input.sellerId);

      if (productIds.length === 0) {
        return Output.success<IListOrdersForSellerServiceOutput>({
          orders: [],
          total_orders: 0,
          skipped_orders: 0,
          remaining_orders: 0,
          hasNextPage: false,
        });
      }

      const { orders, total } = await this.orderRepository.findBySellerProductIds(
        productIds,
        input.page,
        input.size,
      );

      const enrichedOrders: IOrderForSellerItem[] = [];

      for (const order of orders) {
        let total_price = 0;
        const products: IOrderProductForSellerOutput[] = [];

        for (const item of order.products) {
          const product = await this.productRepository.findById(item.productId);
          if (!product) continue;

          const category = await this.categoryRepository.findById(product.categoryId);

          total_price += product.price.value * item.ammount.value;

          products.push({
            id: product.id.value,
            name: product.name.value,
            description: product.description.value,
            price: product.price.value,
            image_url: product.imageUrl.value,
            category: category ? category.name.value : '',
            ammount: item.ammount.value,
          });
        }

        enrichedOrders.push({
          id: order.id.value,
          status: order.status.value,
          total_price,
          created_at: order.createdAt.value.toISOString(),
          customer_id: order.customerId.value,
          products,
        });
      }

      const skipped = (input.page - 1) * input.size;
      const remaining = Math.max(0, total - skipped - orders.length);

      return Output.success<IListOrdersForSellerServiceOutput>({
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

export { ListOrdersForSellerUseCase };
