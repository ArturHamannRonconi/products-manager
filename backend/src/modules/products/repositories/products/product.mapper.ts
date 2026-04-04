import { Injectable } from '@nestjs/common';
import { IBidirectionalMapper, IdValueObject, DateValueObject } from 'ddd-tool-kit';
import { IProductSchema } from './schema/product.schema';
import { ProductAggregate } from '../../domain/product.aggregate-root';
import { ProductNameValueObject } from '../../domain/value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from '../../domain/value-objects/product-description/product-description.value-object';
import { PriceValueObject } from '../../domain/value-objects/price/price.value-object';
import { ImageUrlValueObject } from '../../domain/value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from '../../domain/value-objects/inventory-amount/inventory-amount.value-object';

@Injectable()
class ProductMapper implements IBidirectionalMapper<IProductSchema, ProductAggregate> {
  toRightSide(leftSide: IProductSchema): ProductAggregate {
    return ProductAggregate.init({
      id: IdValueObject.init({ value: leftSide.id }).result as IdValueObject,
      name: ProductNameValueObject.init({ value: leftSide.name }).result as ProductNameValueObject,
      description: ProductDescriptionValueObject.init({ value: leftSide.description }).result as ProductDescriptionValueObject,
      price: PriceValueObject.init({ value: leftSide.price }).result as PriceValueObject,
      imageUrl: ImageUrlValueObject.init({ value: leftSide.image_url }).result as ImageUrlValueObject,
      sellerId: IdValueObject.init({ value: leftSide.seller_id }).result as IdValueObject,
      categoryId: IdValueObject.init({ value: leftSide.category_id }).result as IdValueObject,
      inventoryAmount: InventoryAmountValueObject.init({ value: leftSide.inventory_ammount }).result as InventoryAmountValueObject,
      createdAt: DateValueObject.init({ value: leftSide.created_at }).result as DateValueObject,
      updatedAt: DateValueObject.init({ value: leftSide.updated_at }).result as DateValueObject,
    }).result as ProductAggregate;
  }

  toLeftSide(rightSide: ProductAggregate): IProductSchema {
    return {
      id: rightSide.id.value,
      name: rightSide.name.value,
      description: rightSide.description.value,
      price: rightSide.price.value,
      image_url: rightSide.imageUrl.value,
      seller_id: rightSide.sellerId.value,
      category_id: rightSide.categoryId.value,
      inventory_ammount: rightSide.inventoryAmount.value,
      created_at: rightSide.createdAt.value,
      updated_at: rightSide.updatedAt.value,
    };
  }
}

export { ProductMapper };
