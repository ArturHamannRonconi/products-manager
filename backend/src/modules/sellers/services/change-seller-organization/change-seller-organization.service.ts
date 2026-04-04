import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { SELLER_NOT_FOUND } from '../../domain/seller.errors';

interface IChangeSellerOrganizationServiceInput {
  sellerId: string;
  name: string;
}

@Injectable()
class ChangeSellerOrganizationService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute(
    input: IChangeSellerOrganizationServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.sellerId }).result as IdValueObject;
      const seller = await this.sellerRepository.findById(id);
      if (!seller) return Output.fail(SELLER_NOT_FOUND);

      const initOrg = OrganizationNameValueObject.init({ value: input.name });
      if (initOrg.isFailure) return throwFailOutput(initOrg);

      seller.changeOrganizationName(initOrg.result as OrganizationNameValueObject);
      await this.sellerRepository.save(seller);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { ChangeSellerOrganizationService, IChangeSellerOrganizationServiceInput };
