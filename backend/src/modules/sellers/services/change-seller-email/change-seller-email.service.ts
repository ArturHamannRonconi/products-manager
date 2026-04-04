import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import {
  SELLER_NOT_FOUND,
  SELLER_EMAIL_ALREADY_EXISTS,
} from '../../domain/seller.errors';

interface IChangeSellerEmailServiceInput {
  sellerId: string;
  email: string;
}

@Injectable()
class ChangeSellerEmailService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute(
    input: IChangeSellerEmailServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.sellerId }).result as IdValueObject;
      const seller = await this.sellerRepository.findById(id);
      if (!seller) return Output.fail(SELLER_NOT_FOUND);

      const initEmail = EmailValueObject.init({ value: input.email });
      if (initEmail.isFailure) return throwFailOutput(initEmail);
      const newEmail = initEmail.result as EmailValueObject;

      const existingWithEmail = await this.sellerRepository.findByEmail(newEmail);
      if (existingWithEmail && existingWithEmail.id.value !== seller.id.value) {
        return Output.fail(SELLER_EMAIL_ALREADY_EXISTS);
      }

      seller.changeEmail(newEmail);
      await this.sellerRepository.save(seller);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { ChangeSellerEmailService, IChangeSellerEmailServiceInput };
