import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import {
  SELLER_NOT_FOUND,
  SELLER_EMAIL_OR_PASSWORD_INCORRECT,
} from '../../domain/seller.errors';

interface IChangeSellerPasswordServiceInput {
  sellerId: string;
  oldPassword: string;
  newPassword: string;
}

@Injectable()
class ChangeSellerPasswordService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute(
    input: IChangeSellerPasswordServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.sellerId }).result as IdValueObject;
      const seller = await this.sellerRepository.findById(id);
      if (!seller) return Output.fail(SELLER_NOT_FOUND);

      const isValid = seller.validatePassword(input.oldPassword);
      if (!isValid) return Output.fail(SELLER_EMAIL_OR_PASSWORD_INCORRECT);

      const initPassword = PasswordValueObject.init({ value: input.newPassword });
      if (initPassword.isFailure) return throwFailOutput(initPassword);

      seller.changePassword(initPassword.result as PasswordValueObject);
      await this.sellerRepository.save(seller);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { ChangeSellerPasswordService, IChangeSellerPasswordServiceInput };
