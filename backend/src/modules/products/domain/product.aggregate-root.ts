import {
  Aggregate,
  Output,
  verifyAllPropsExists,
  verifyAreValueObjects,
  IdValueObject,
} from 'ddd-tool-kit';
import { IProductProps } from './product.props';
import { INVALID_PRODUCT } from './product.errors';
import { ProductNameValueObject } from './value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from './value-objects/product-description/product-description.value-object';
import { PriceValueObject } from './value-objects/price/price.value-object';
import { ImageUrlValueObject } from './value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from './value-objects/inventory-amount/inventory-amount.value-object';

class ProductAggregate extends Aggregate<IProductProps> {
  private constructor(props: IProductProps) {
    super(props);
  }

  get name(): ProductNameValueObject {
    return this.props.name;
  }

  get description(): ProductDescriptionValueObject {
    return this.props.description;
  }

  get price(): PriceValueObject {
    return this.props.price;
  }

  get imageUrl(): ImageUrlValueObject {
    return this.props.imageUrl;
  }

  get sellerId(): IdValueObject {
    return this.props.sellerId;
  }

  get categoryId(): IdValueObject {
    return this.props.categoryId;
  }

  get inventoryAmount(): InventoryAmountValueObject {
    return this.props.inventoryAmount;
  }

  changeName(name: ProductNameValueObject): void {
    this.props.name = name;
  }

  changeDescription(description: ProductDescriptionValueObject): void {
    this.props.description = description;
  }

  changePrice(price: PriceValueObject): void {
    this.props.price = price;
  }

  changeCategoryId(categoryId: IdValueObject): void {
    this.props.categoryId = categoryId;
  }

  changeInventoryAmount(inventoryAmount: InventoryAmountValueObject): void {
    this.props.inventoryAmount = inventoryAmount;
  }

  setImageUrl(imageUrl: ImageUrlValueObject): void {
    this.props.imageUrl = imageUrl;
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    const valueObjects = [
      'name',
      'description',
      'price',
      'imageUrl',
      'sellerId',
      'categoryId',
      'inventoryAmount',
      ...this.defaultValueObjects,
    ];

    const allPropsExists = verifyAllPropsExists(valueObjects, this);
    const areValueObjects = verifyAreValueObjects(
      ['name', 'description', 'price', 'imageUrl', 'sellerId', 'categoryId', 'inventoryAmount'],
      this,
    );

    return allPropsExists && areValueObjects;
  }

  static init(props: IProductProps) {
    const product = new ProductAggregate(props);

    const isInvalidProps = !product.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_PRODUCT);

    return Output.success(product);
  }
}

export { ProductAggregate };
