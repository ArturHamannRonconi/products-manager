import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { ProductRepository } from '../../repositories/products/product-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { PRODUCT_NOT_FOUND } from '../../domain/product.errors';

interface IDeleteProductServiceInput {
  productId: string;
}

@Injectable()
class DeleteProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    input: IDeleteProductServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const productId = IdValueObject.init({ value: input.productId }).result as IdValueObject;
      const product = await this.productRepository.findById(productId);
      if (!product) return Output.fail(PRODUCT_NOT_FOUND);

      const categoryId = product.categoryId;

      await this.productRepository.delete(product.id);

      const count = await this.productRepository.countByCategoryId(categoryId);
      if (count === 0) {
        await this.categoryRepository.delete(categoryId);
      }

      return Output.success(undefined as any);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { DeleteProductService, IDeleteProductServiceInput };
