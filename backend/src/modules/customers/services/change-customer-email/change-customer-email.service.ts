import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import {
  CUSTOMER_NOT_FOUND,
  CUSTOMER_EMAIL_ALREADY_EXISTS,
} from '../../domain/customer.errors';

interface IChangeCustomerEmailServiceInput {
  customerId: string;
  email: string;
}

@Injectable()
class ChangeCustomerEmailService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    input: IChangeCustomerEmailServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.customerId }).result as IdValueObject;
      const customer = await this.customerRepository.findById(id);
      if (!customer) return Output.fail(CUSTOMER_NOT_FOUND);

      const initEmail = EmailValueObject.init({ value: input.email });
      if (initEmail.isFailure) return throwFailOutput(initEmail);
      const newEmail = initEmail.result as EmailValueObject;

      const existingWithEmail = await this.customerRepository.findByEmail(newEmail);
      if (existingWithEmail && existingWithEmail.id.value !== customer.id.value) {
        return Output.fail(CUSTOMER_EMAIL_ALREADY_EXISTS);
      }

      customer.changeEmail(newEmail);
      await this.customerRepository.save(customer);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { ChangeCustomerEmailService, IChangeCustomerEmailServiceInput };
