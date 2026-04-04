import { Injectable } from '@nestjs/common';
import {
  Output,
  IError,
  throwFailOutput,
  throwFailInternalServer,
  IdValueObject,
  DateValueObject,
  HttpStatus,
} from 'ddd-tool-kit';
import { OrderRepository } from '../../repositories/orders/order-repository.interface';
import { ProductRepository } from '../../../products/repositories/products/product-repository.interface';
import { OrderAggregate } from '../../domain/order.aggregate-root';
import { OrderStatusValueObject } from '../../domain/value-objects/order-status/order-status.value-object';
import { OrderItemEntity } from '../../domain/entities/order-item/order-item.entity';
import { AmountValueObject } from '../../domain/value-objects/amount/amount.value-object';
import { INSUFFICIENT_STOCK } from '../../domain/order.errors';
import { PRODUCT_NOT_FOUND } from '../../../products/domain/product.errors';
import { InventoryAmountValueObject } from '../../../products/domain/value-objects/inventory-amount/inventory-amount.value-object';

const MIXED_SELLERS = {
  message: 'All products in an order must belong to the same seller.',
  statusCode: HttpStatus.BAD_REQUEST,
};

interface IOrderItemInput {
  product_id: string;
  ammount: number;
}

interface ICreateOrderInput {
  products: IOrderItemInput[];
}

interface ICreateBatchOrdersServiceInput {
  orders: ICreateOrderInput[];
  customerId: string;
}

interface IOrderItemCreatedOutput {
  product_id: string;
  ammount: number;
}

interface IOrderCreatedOutput {
  id: string;
  status: string;
  products: IOrderItemCreatedOutput[];
}

interface ICreateBatchOrdersServiceOutput {
  orders: IOrderCreatedOutput[];
}

@Injectable()
class CreateBatchOrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    input: ICreateBatchOrdersServiceInput,
  ): Promise<Output<ICreateBatchOrdersServiceOutput> | Output<IError>> {
    try {
      const customerId = IdValueObject.init({ value: input.customerId }).result as IdValueObject;

      // Validate seller consistency and stock for all orders before creating any
      for (const orderInput of input.orders) {
        let orderSellerId: string | null = null;

        for (const item of orderInput.products) {
          const productId = IdValueObject.init({ value: item.product_id }).result as IdValueObject;
          const product = await this.productRepository.findById(productId);

          if (!product) return Output.fail(PRODUCT_NOT_FOUND);

          if (orderSellerId === null) {
            orderSellerId = product.sellerId.value;
          } else if (product.sellerId.value !== orderSellerId) {
            return Output.fail(MIXED_SELLERS);
          }

          if (product.inventoryAmount.value < item.ammount) {
            return Output.fail({
              ...INSUFFICIENT_STOCK,
              message: INSUFFICIENT_STOCK.message + product.name.value,
            });
          }
        }
      }

      // Create orders and deduct stock
      const created: IOrderCreatedOutput[] = [];

      for (const orderInput of input.orders) {
        const items: OrderItemEntity[] = [];

        for (const item of orderInput.products) {
          const initAmount = AmountValueObject.init({ value: item.ammount });
          if (initAmount.isFailure) return throwFailOutput(initAmount);

          const initItem = OrderItemEntity.init({
            id: IdValueObject.getDefault(),
            createdAt: DateValueObject.getDefault(),
            updatedAt: DateValueObject.getDefault(),
            productId: IdValueObject.init({ value: item.product_id }).result as IdValueObject,
            ammount: initAmount.result as AmountValueObject,
          });
          if (initItem.isFailure) return throwFailOutput(initItem);
          items.push(initItem.result as OrderItemEntity);
        }

        const initStatus = OrderStatusValueObject.init({ value: 'pending' });
        if (initStatus.isFailure) return throwFailOutput(initStatus);

        const initOrder = OrderAggregate.init({
          id: IdValueObject.getDefault(),
          createdAt: DateValueObject.getDefault(),
          updatedAt: DateValueObject.getDefault(),
          status: initStatus.result as OrderStatusValueObject,
          customerId,
          products: items,
        });
        if (initOrder.isFailure) return throwFailOutput(initOrder);

        const order = initOrder.result as OrderAggregate;
        await this.orderRepository.save(order);

        // Deduct inventory (V1: no transaction — partial failure is a known limitation)
        for (const item of orderInput.products) {
          const productId = IdValueObject.init({ value: item.product_id }).result as IdValueObject;
          const product = await this.productRepository.findById(productId);
          if (product) {
            const newAmount = InventoryAmountValueObject.init({
              value: product.inventoryAmount.value - item.ammount,
            }).result as InventoryAmountValueObject;
            product.changeInventoryAmount(newAmount);
            await this.productRepository.save(product);
          }
        }

        created.push({
          id: order.id.value,
          status: order.status.value,
          products: order.products.map((p) => ({
            product_id: p.productId.value,
            ammount: p.ammount.value,
          })),
        });
      }

      return Output.success({ orders: created });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  CreateBatchOrdersService,
  ICreateBatchOrdersServiceInput,
  ICreateBatchOrdersServiceOutput,
  IOrderCreatedOutput,
};
