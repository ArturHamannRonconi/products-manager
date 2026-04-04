import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import {
  CUSTOMER_NOT_FOUND,
  CUSTOMER_EMAIL_OR_PASSWORD_INCORRECT,
} from '../../domain/customer.errors';

interface IChangeCustomerPasswordServiceInput {
  customerId: string;
  oldPassword: string;
  newPassword: string;
}

@Injectable()
class ChangeCustomerPasswordService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    input: IChangeCustomerPasswordServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.customerId }).result as IdValueObject;
      const customer = await this.customerRepository.findById(id);
      if (!customer) return Output.fail(CUSTOMER_NOT_FOUND);

      const isValid = customer.validatePassword(input.oldPassword);
      if (!isValid) return Output.fail(CUSTOMER_EMAIL_OR_PASSWORD_INCORRECT);

      const initPassword = PasswordValueObject.init({ value: input.newPassword });
      if (initPassword.isFailure) return throwFailOutput(initPassword);

      customer.changePassword(initPassword.result as PasswordValueObject);
      await this.customerRepository.save(customer);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { ChangeCustomerPasswordService, IChangeCustomerPasswordServiceInput };
