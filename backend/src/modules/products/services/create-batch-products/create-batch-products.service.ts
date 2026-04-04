import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject, DateValueObject } from 'ddd-tool-kit';
import { ProductRepository } from '../../repositories/products/product-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { CategoryAggregate } from '../../../categories/domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../../categories/domain/value-objects/category-name/category-name.value-object';
import { ProductAggregate } from '../../domain/product.aggregate-root';
import { ProductNameValueObject } from '../../domain/value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from '../../domain/value-objects/product-description/product-description.value-object';
import { PriceValueObject } from '../../domain/value-objects/price/price.value-object';
import { ImageUrlValueObject } from '../../domain/value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from '../../domain/value-objects/inventory-amount/inventory-amount.value-object';

interface ICreateProductItem {
  name: string;
  description: string;
  category: string;
  price: number;
  inventory_ammount: number;
}

interface ICreateBatchProductsServiceInput {
  products: ICreateProductItem[];
  sellerId: string;
}

interface IProductCreatedOutput {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inventory_ammount: number;
}

interface ICreateBatchProductsServiceOutput {
  products: IProductCreatedOutput[];
}

@Injectable()
class CreateBatchProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    input: ICreateBatchProductsServiceInput,
  ): Promise<Output<ICreateBatchProductsServiceOutput> | Output<IError>> {
    try {
      const created: IProductCreatedOutput[] = [];

      const sellerId = IdValueObject.init({ value: input.sellerId }).result as IdValueObject;

      for (const item of input.products) {
        const initCategoryName = CategoryNameValueObject.init({ value: item.category });
        if (initCategoryName.isFailure) return throwFailOutput(initCategoryName);
        const categoryName = initCategoryName.result as CategoryNameValueObject;

        let category = await this.categoryRepository.findByName(categoryName);
        if (!category) {
          const initCategory = CategoryAggregate.init({
            id: IdValueObject.getDefault(),
            createdAt: DateValueObject.getDefault(),
            updatedAt: DateValueObject.getDefault(),
            name: categoryName,
          });
          if (initCategory.isFailure) return throwFailOutput(initCategory);
          category = initCategory.result as CategoryAggregate;
          await this.categoryRepository.save(category);
        }

        const initName = ProductNameValueObject.init({ value: item.name });
        if (initName.isFailure) return throwFailOutput(initName);

        const initDescription = ProductDescriptionValueObject.init({ value: item.description });
        if (initDescription.isFailure) return throwFailOutput(initDescription);

        const initPrice = PriceValueObject.init({ value: item.price });
        if (initPrice.isFailure) return throwFailOutput(initPrice);

        const initInventory = InventoryAmountValueObject.init({ value: item.inventory_ammount });
        if (initInventory.isFailure) return throwFailOutput(initInventory);

        const imageUrl = ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject;

        const initProduct = ProductAggregate.init({
          id: IdValueObject.getDefault(),
          createdAt: DateValueObject.getDefault(),
          updatedAt: DateValueObject.getDefault(),
          name: initName.result as ProductNameValueObject,
          description: initDescription.result as ProductDescriptionValueObject,
          price: initPrice.result as PriceValueObject,
          imageUrl,
          sellerId,
          categoryId: category.id,
          inventoryAmount: initInventory.result as InventoryAmountValueObject,
        });
        if (initProduct.isFailure) return throwFailOutput(initProduct);

        const product = initProduct.result as ProductAggregate;
        await this.productRepository.save(product);

        created.push({
          id: product.id.value,
          name: product.name.value,
          description: product.description.value,
          category: category.name.value,
          price: product.price.value,
          inventory_ammount: product.inventoryAmount.value,
        });
      }

      return Output.success({ products: created });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  CreateBatchProductsService,
  ICreateBatchProductsServiceInput,
  ICreateBatchProductsServiceOutput,
  IProductCreatedOutput,
};
