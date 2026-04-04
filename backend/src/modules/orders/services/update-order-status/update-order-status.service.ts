import { Injectable } from '@nestjs/common';
import {
  Output,
  IError,
  throwFailOutput,
  throwFailInternalServer,
  IdValueObject,
} from 'ddd-tool-kit';
import { OrderRepository } from '../../repositories/orders/order-repository.interface';
import { ProductRepository } from '../../../products/repositories/products/product-repository.interface';
import { SellerRepository } from '../../../sellers/repositories/sellers/seller-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { OrderStatusValueObject } from '../../domain/value-objects/order-status/order-status.value-object';
import {
  ORDER_NOT_FOUND,
  ORDER_OWNERSHIP_FORBIDDEN,
} from '../../domain/order.errors';

interface IUpdateOrderStatusServiceInput {
  orderId: string;
  status: string;
  sellerId: string;
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

interface IUpdateOrderStatusServiceOutput {
  id: string;
  status: string;
  total_price: number;
  products: IOrderProductOutput[];
}

@Injectable()
class UpdateOrderStatusService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    input: IUpdateOrderStatusServiceInput,
  ): Promise<Output<IUpdateOrderStatusServiceOutput> | Output<IError>> {
    try {
      const orderId = IdValueObject.init({ value: input.orderId }).result as IdValueObject;
      const order = await this.orderRepository.findById(orderId);
      if (!order) return Output.fail(ORDER_NOT_FOUND);

      // Ownership check: at least one product must belong to the seller
      let sellerOwnsOrder = false;
      for (const item of order.products) {
        const product = await this.productRepository.findById(item.productId);
        if (product && product.sellerId.value === input.sellerId) {
          sellerOwnsOrder = true;
          break;
        }
      }
      if (!sellerOwnsOrder) return Output.fail(ORDER_OWNERSHIP_FORBIDDEN);

      const initStatus = OrderStatusValueObject.init({ value: input.status });
      if (initStatus.isFailure) return throwFailOutput(initStatus);

      order.changeStatus(initStatus.result as OrderStatusValueObject);
      await this.orderRepository.save(order);

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

      return Output.success({
        id: order.id.value,
        status: order.status.value,
        total_price,
        products,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  UpdateOrderStatusService,
  IUpdateOrderStatusServiceInput,
  IUpdateOrderStatusServiceOutput,
};
