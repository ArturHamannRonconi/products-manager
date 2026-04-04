import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { ProductAggregate } from './product.aggregate-root';
import { ProductNameValueObject } from './value-objects/product-name/product-name.value-object';
import { ProductDescriptionValueObject } from './value-objects/product-description/product-description.value-object';
import { PriceValueObject } from './value-objects/price/price.value-object';
import { ImageUrlValueObject } from './value-objects/image-url/image-url.value-object';
import { InventoryAmountValueObject } from './value-objects/inventory-amount/inventory-amount.value-object';

function buildProduct(overrides: Partial<Record<string, any>> = {}): ProductAggregate {
  return ProductAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: ProductNameValueObject.init({ value: 'Test Product' }).result as ProductNameValueObject,
    description: ProductDescriptionValueObject.init({ value: 'A description.' }).result as ProductDescriptionValueObject,
    price: PriceValueObject.init({ value: 10.0 }).result as PriceValueObject,
    imageUrl: ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject,
    sellerId: IdValueObject.getDefault(),
    categoryId: IdValueObject.getDefault(),
    inventoryAmount: InventoryAmountValueObject.init({ value: 5 }).result as InventoryAmountValueObject,
    ...overrides,
  }).result as ProductAggregate;
}

describe('ProductAggregate', () => {
  it('should create a valid product', () => {
    const result = ProductAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      name: ProductNameValueObject.init({ value: 'My Product' }).result as ProductNameValueObject,
      description: ProductDescriptionValueObject.init({ value: 'Description here.' }).result as ProductDescriptionValueObject,
      price: PriceValueObject.init({ value: 19.99 }).result as PriceValueObject,
      imageUrl: ImageUrlValueObject.init({ value: null }).result as ImageUrlValueObject,
      sellerId: IdValueObject.getDefault(),
      categoryId: IdValueObject.getDefault(),
      inventoryAmount: InventoryAmountValueObject.init({ value: 10 }).result as InventoryAmountValueObject,
    });

    expect(result.isSuccess).toBe(true);
    const product = result.result as ProductAggregate;
    expect(product.name.value).toBe('My Product');
    expect(product.price.value).toBe(19.99);
  });

  it('should change name', () => {
    const product = buildProduct();
    const newName = ProductNameValueObject.init({ value: 'Updated Name' }).result as ProductNameValueObject;
    product.changeName(newName);
    expect(product.name.value).toBe('Updated Name');
  });

  it('should change price', () => {
    const product = buildProduct();
    const newPrice = PriceValueObject.init({ value: 25.0 }).result as PriceValueObject;
    product.changePrice(newPrice);
    expect(product.price.value).toBe(25.0);
  });

  it('should set image url', () => {
    const product = buildProduct();
    const url = ImageUrlValueObject.init({ value: 'https://example.com/img.jpg' }).result as ImageUrlValueObject;
    product.setImageUrl(url);
    expect(product.imageUrl.value).toBe('https://example.com/img.jpg');
  });
});
