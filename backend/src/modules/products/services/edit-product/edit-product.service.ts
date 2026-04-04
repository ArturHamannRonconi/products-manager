import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject, DateValueObject } from 'ddd-tool-kit';
import { ProductRepository, IProductSellerView } from '../../repositories/products/product-repository.interface';
import { CategoryRepository } from '../../../categories/repositories/categories/category-repository.interface';
import { SellerRepository } from '../../../sellers/repositories/sellers/seller-repository.interface';
import { CategoryAggregate } from '../../../categories/domain/category.aggregate-root';
import { CategoryNameValueObject } from '../../../categories/domain/value-objects/category-name/category-name.value-object';
import { ProductNameValueObject } from '../../domain/value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from '../../domain/value-objects/product-description/product-description.value-object';
import { PriceValueObject } from '../../domain/value-objects/price/price.value-object';
import { InventoryAmountValueObject } from '../../domain/value-objects/inventory-amount/inventory-amount.value-object';
import { PRODUCT_NOT_FOUND } from '../../domain/product.errors';

interface IEditProductServiceInput {
  productId: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  inventory_ammount?: number;
}

interface IEditProductServiceOutput extends IProductSellerView {}

@Injectable()
class EditProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly sellerRepository: SellerRepository,
  ) {}

  async execute(
    input: IEditProductServiceInput,
  ): Promise<Output<IEditProductServiceOutput> | Output<IError>> {
    try {
      const productId = IdValueObject.init({ value: input.productId }).result as IdValueObject;
      const product = await this.productRepository.findById(productId);
      if (!product) return Output.fail(PRODUCT_NOT_FOUND);

      if (input.name !== undefined) {
        const initName = ProductNameValueObject.init({ value: input.name });
        if (initName.isFailure) return throwFailOutput(initName);
        product.changeName(initName.result as ProductNameValueObject);
      }

      if (input.description !== undefined) {
        const initDesc = ProductDescriptionValueObject.init({ value: input.description });
        if (initDesc.isFailure) return throwFailOutput(initDesc);
        product.changeDescription(initDesc.result as ProductDescriptionValueObject);
      }

      if (input.price !== undefined) {
        const initPrice = PriceValueObject.init({ value: input.price });
        if (initPrice.isFailure) return throwFailOutput(initPrice);
        product.changePrice(initPrice.result as PriceValueObject);
      }

      if (input.inventory_ammount !== undefined) {
        const initInventory = InventoryAmountValueObject.init({ value: input.inventory_ammount });
        if (initInventory.isFailure) return throwFailOutput(initInventory);
        product.changeInventoryAmount(initInventory.result as InventoryAmountValueObject);
      }

      if (input.category !== undefined) {
        const oldCategoryId = product.categoryId;

        const initCategoryName = CategoryNameValueObject.init({ value: input.category });
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

        product.changeCategoryId(category.id);
        await this.productRepository.save(product);

        const remainingCount = await this.productRepository.countByCategoryId(oldCategoryId);
        if (remainingCount === 0) {
          await this.categoryRepository.delete(oldCategoryId);
        }
      } else {
        await this.productRepository.save(product);
      }

      const { products } = await this.productRepository.findForSellers({ sellerId: product.sellerId.value, page: 1, size: 10000, sortBy: 'createdAt', order: 'desc' });
      const view = products.find((p) => p.id === input.productId);

      if (!view) {
        return Output.success({
          id: product.id.value,
          name: product.name.value,
          description: product.description.value,
          image_url: product.imageUrl.value,
          price: product.price.value,
          seller_name: '',
          seller_id: product.sellerId.value,
          category_name: '',
          category_id: product.categoryId.value,
          inventory_ammount: product.inventoryAmount.value,
        });
      }

      return Output.success(view);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  EditProductService,
  IEditProductServiceInput,
  IEditProductServiceOutput,
};
