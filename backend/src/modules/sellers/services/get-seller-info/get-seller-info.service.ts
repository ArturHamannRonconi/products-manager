import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SELLER_NOT_FOUND } from '../../domain/seller.errors';

interface IGetSellerInfoServiceInput {
  sellerId: string;
}

interface IGetSellerInfoServiceOutput {
  id: string;
  name: string;
  email: string;
  organization_name: string;
}

@Injectable()
class GetSellerInfoService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute(
    input: IGetSellerInfoServiceInput,
  ): Promise<Output<IGetSellerInfoServiceOutput> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.sellerId }).result as IdValueObject;
      const seller = await this.sellerRepository.findById(id);
      if (!seller) return Output.fail(SELLER_NOT_FOUND);

      return Output.success({
        id: seller.id.value,
        name: seller.name.value,
        email: seller.email.value,
        organization_name: seller.organizationName.value,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  GetSellerInfoService,
  IGetSellerInfoServiceInput,
  IGetSellerInfoServiceOutput,
};
