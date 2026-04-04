import { IBaseDomainAggregate, IdValueObject } from 'ddd-tool-kit';
import { ProductNameValueObject } from './value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from './value-objects/product-description/product-description.value-object';
import { PriceValueObject } from './value-objects/price/price.value-object';
import { ImageUrlValueObject } from './value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from './value-objects/inventory-amount/inventory-amount.value-object';

interface IProductProps extends IBaseDomainAggregate {
  name: ProductNameValueObject;
  description: ProductDescriptionValueObject;
  price: PriceValueObject;
  imageUrl: ImageUrlValueObject;
  sellerId: IdValueObject;
  categoryId: IdValueObject;
  inventoryAmount: InventoryAmountValueObject;
}

export { IProductProps };
