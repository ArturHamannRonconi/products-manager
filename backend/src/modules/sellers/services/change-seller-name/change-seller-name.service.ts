import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { SELLER_NOT_FOUND } from '../../domain/seller.errors';

interface IChangeSellerNameServiceInput {
  sellerId: string;
  name: string;
}

@Injectable()
class ChangeSellerNameService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute(
    input: IChangeSellerNameServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.sellerId }).result as IdValueObject;
      const seller = await this.sellerRepository.findById(id);
      if (!seller) return Output.fail(SELLER_NOT_FOUND);

      const initName = NameValueObject.init({ value: input.name });
      if (initName.isFailure) return throwFailOutput(initName);

      seller.changeName(initName.result as NameValueObject);
      await this.sellerRepository.save(seller);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { ChangeSellerNameService, IChangeSellerNameServiceInput };
