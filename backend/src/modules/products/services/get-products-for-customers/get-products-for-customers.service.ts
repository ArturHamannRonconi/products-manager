import { HttpStatus, Injectable } from '@nestjs/common';
import { Output, IError, throwFailInternalServer } from 'ddd-tool-kit';
import { ProductRepository, IProductCustomerView } from '../../repositories/products/product-repository.interface';

interface IGetProductsForCustomersServiceInput {
  page: number;
  size: number;
  searchByText?: string;
  sortBy: string;
  order: string;
  minPrice?: number;
  maxPrice?: number;
}

interface IGetProductsForCustomersServiceOutput {
  products: IProductCustomerView[];
  total_products: number;
  skipped_products: number;
  remaining_products: number;
  hasNextPage: boolean;
}

@Injectable()
class GetProductsForCustomersService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    input: IGetProductsForCustomersServiceInput,
  ): Promise<Output<IGetProductsForCustomersServiceOutput> | Output<IError>> {
    try {
      const { page, size, searchByText, sortBy, order, minPrice, maxPrice } = input;

      if (minPrice !== undefined && minPrice < 0) {
        return Output.fail({ statusCode: HttpStatus.BAD_REQUEST, message: 'min_price cannot be negative.' });
      }
      if (maxPrice !== undefined && maxPrice < 0) {
        return Output.fail({ statusCode: HttpStatus.BAD_REQUEST, message: 'max_price cannot be negative.' });
      }
      if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        return Output.fail({ statusCode: HttpStatus.BAD_REQUEST, message: 'min_price cannot be greater than max_price.' });
      }

      const { products, total } = await this.productRepository.findForCustomers({
        page,
        size,
        searchByText,
        sortBy,
        order,
        minPrice,
        maxPrice,
      });

      const totalPages = Math.ceil(total / size) || 1;
      const effectivePage = Math.min(page, totalPages);
      const skipped = (effectivePage - 1) * size;
      const remaining = total - skipped - products.length;
      const hasNextPage = remaining > 0;

      return Output.success({
        products,
        total_products: total,
        skipped_products: skipped,
        remaining_products: remaining,
        hasNextPage,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  GetProductsForCustomersService,
  IGetProductsForCustomersServiceInput,
  IGetProductsForCustomersServiceOutput,
};
