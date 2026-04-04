import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer } from 'ddd-tool-kit';
import { SellerRepository } from '../../repositories/sellers/seller-repository.interface';
import { SellerAggregate } from '../../domain/seller.aggregate-root';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { OrganizationNameValueObject } from '../../domain/value-objects/organization-name/organization-name.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import { SELLER_EMAIL_ALREADY_EXISTS } from '../../domain/seller.errors';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';

interface ICreateSellerItem {
  name: string;
  email: string;
  password: string;
  organization_name: string;
}

interface ICreateBatchSellersServiceInput {
  sellers: ICreateSellerItem[];
}

interface ISellerOutputItem {
  id: string;
  name: string;
  email: string;
  organization_name: string;
}

interface ICreateBatchSellersServiceOutput {
  sellers: ISellerOutputItem[];
}

@Injectable()
class CreateBatchSellersService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute(
    input: ICreateBatchSellersServiceInput,
  ): Promise<Output<ICreateBatchSellersServiceOutput> | Output<IError>> {
    try {
      const created: ISellerOutputItem[] = [];

      for (const item of input.sellers) {
        const initEmail = EmailValueObject.init({ value: item.email });
        if (initEmail.isFailure) return throwFailOutput(initEmail);
        const email = initEmail.result as EmailValueObject;

        const existing = await this.sellerRepository.findByEmail(email);
        if (existing) return Output.fail(SELLER_EMAIL_ALREADY_EXISTS);

        const initName = NameValueObject.init({ value: item.name });
        if (initName.isFailure) return throwFailOutput(initName);

        const initPassword = PasswordValueObject.init({ value: item.password });
        if (initPassword.isFailure) return throwFailOutput(initPassword);

        const initOrg = OrganizationNameValueObject.init({
          value: item.organization_name,
        });
        if (initOrg.isFailure) return throwFailOutput(initOrg);

        const initSeller = SellerAggregate.init({
          id: IdValueObject.getDefault(),
          createdAt: DateValueObject.getDefault(),
          updatedAt: DateValueObject.getDefault(),
          name: initName.result as NameValueObject,
          email,
          password: initPassword.result as PasswordValueObject,
          organizationName: initOrg.result as OrganizationNameValueObject,
          refreshTokens: [],
        });
        if (initSeller.isFailure) return throwFailOutput(initSeller);

        const seller = initSeller.result as SellerAggregate;
        await this.sellerRepository.save(seller);

        created.push({
          id: seller.id.value,
          name: seller.name.value,
          email: seller.email.value,
          organization_name: seller.organizationName.value,
        });
      }

      return Output.success({ sellers: created });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  CreateBatchSellersService,
  ICreateBatchSellersServiceInput,
  ICreateBatchSellersServiceOutput,
};
