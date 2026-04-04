import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import { CUSTOMER_EMAIL_ALREADY_EXISTS } from '../../domain/customer.errors';

interface ICreateCustomerItem {
  name: string;
  email: string;
  password: string;
}

interface ICreateBatchCustomersServiceInput {
  customers: ICreateCustomerItem[];
}

interface ICustomerOutputItem {
  id: string;
  name: string;
  email: string;
}

interface ICreateBatchCustomersServiceOutput {
  customers: ICustomerOutputItem[];
}

@Injectable()
class CreateBatchCustomersService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    input: ICreateBatchCustomersServiceInput,
  ): Promise<Output<ICreateBatchCustomersServiceOutput> | Output<IError>> {
    try {
      const created: ICustomerOutputItem[] = [];

      for (const item of input.customers) {
        const initEmail = EmailValueObject.init({ value: item.email });
        if (initEmail.isFailure) return throwFailOutput(initEmail);
        const email = initEmail.result as EmailValueObject;

        const existing = await this.customerRepository.findByEmail(email);
        if (existing) return Output.fail(CUSTOMER_EMAIL_ALREADY_EXISTS);

        const initName = NameValueObject.init({ value: item.name });
        if (initName.isFailure) return throwFailOutput(initName);

        const initPassword = PasswordValueObject.init({ value: item.password });
        if (initPassword.isFailure) return throwFailOutput(initPassword);

        const initCustomer = CustomerAggregate.init({
          id: IdValueObject.getDefault(),
          createdAt: DateValueObject.getDefault(),
          updatedAt: DateValueObject.getDefault(),
          name: initName.result as NameValueObject,
          email,
          password: initPassword.result as PasswordValueObject,
          refreshTokens: [],
        });
        if (initCustomer.isFailure) return throwFailOutput(initCustomer);

        const customer = initCustomer.result as CustomerAggregate;
        await this.customerRepository.save(customer);

        created.push({
          id: customer.id.value,
          name: customer.name.value,
          email: customer.email.value,
        });
      }

      return Output.success({ customers: created });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  CreateBatchCustomersService,
  ICreateBatchCustomersServiceInput,
  ICreateBatchCustomersServiceOutput,
};
