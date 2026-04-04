import { Injectable, Inject } from '@nestjs/common';
import { Output, IError, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { FILE_PROVIDER, IFileProvider } from '../../../../providers/file/file.interface';
import { ProductRepository, IProductSellerView } from '../../repositories/products/product-repository.interface';
import { ImageUrlValueObject } from '../../domain/value-objects/image-url/image-url.value-object';
import { PRODUCT_NOT_FOUND } from '../../domain/product.errors';
import * as path from 'path';

interface IUploadProductImageServiceInput {
  productId: string;
  file: {
    filename: string;
    buffer: Buffer;
    mimetype: string;
  };
}

interface IUploadProductImageServiceOutput extends IProductSellerView {}

@Injectable()
class UploadProductImageService {
  constructor(
    private readonly productRepository: ProductRepository,
    @Inject(FILE_PROVIDER) private readonly fileProvider: IFileProvider,
  ) {}

  async execute(
    input: IUploadProductImageServiceInput,
  ): Promise<Output<IUploadProductImageServiceOutput> | Output<IError>> {
    try {
      const productId = IdValueObject.init({ value: input.productId }).result as IdValueObject;
      const product = await this.productRepository.findById(productId);
      if (!product) return Output.fail(PRODUCT_NOT_FOUND);

      const ext = path.extname(input.file.filename) || `.${input.file.mimetype.split('/')[1]}`;
      const filename = `${input.productId}-${Date.now()}${ext}`;

      const { url } = await this.fileProvider.upload({
        filename,
        buffer: input.file.buffer,
        mimetype: input.file.mimetype,
      });

      const imageUrl = ImageUrlValueObject.init({ value: url }).result as ImageUrlValueObject;
      product.setImageUrl(imageUrl);
      await this.productRepository.save(product);

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
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  UploadProductImageService,
  IUploadProductImageServiceInput,
  IUploadProductImageServiceOutput,
};
