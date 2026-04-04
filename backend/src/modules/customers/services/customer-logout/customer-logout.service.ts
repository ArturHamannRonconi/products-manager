import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CUSTOMER_NOT_FOUND } from '../../domain/customer.errors';

interface ICustomerLogoutServiceInput {
  customerId: string;
}

@Injectable()
class CustomerLogoutService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    input: ICustomerLogoutServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.customerId }).result as IdValueObject;
      const customer = await this.customerRepository.findById(id);
      if (!customer) return Output.fail(CUSTOMER_NOT_FOUND);

      customer.clearRefreshTokens();
      await this.customerRepository.save(customer);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { CustomerLogoutService, ICustomerLogoutServiceInput };
