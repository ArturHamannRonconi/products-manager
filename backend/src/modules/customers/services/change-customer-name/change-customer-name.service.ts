import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailOutput, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { CUSTOMER_NOT_FOUND } from '../../domain/customer.errors';

interface IChangeCustomerNameServiceInput {
  customerId: string;
  name: string;
}

@Injectable()
class ChangeCustomerNameService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    input: IChangeCustomerNameServiceInput,
  ): Promise<Output<void> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.customerId }).result as IdValueObject;
      const customer = await this.customerRepository.findById(id);
      if (!customer) return Output.fail(CUSTOMER_NOT_FOUND);

      const initName = NameValueObject.init({ value: input.name });
      if (initName.isFailure) return throwFailOutput(initName);

      customer.changeName(initName.result as NameValueObject);
      await this.customerRepository.save(customer);

      return Output.success(undefined);
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export { ChangeCustomerNameService, IChangeCustomerNameServiceInput };
