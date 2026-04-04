import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SELLER_NOT_FOUND } from '../../domain/seller.errors';

interface ISellerLogoutServiceInput {
  sellerId: string;
}

@Injectable()
class SellerLogoutService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute(
    input: ISellerLogoutServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.sellerId }).result as IdValueObject;
      const seller = await this.sellerRepository.findById(id);
      if (!seller) return Output.fail(SELLER_NOT_FOUND);

      seller.clearRefreshTokens();
      await this.sellerRepository.save(seller);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { SellerLogoutService, ISellerLogoutServiceInput };
