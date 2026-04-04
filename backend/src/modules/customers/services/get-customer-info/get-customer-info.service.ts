import { Injectable } from '@nestjs/common';
import { Output, IError, throwFailInternalServer, IdValueObject } from 'ddd-tool-kit';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CUSTOMER_NOT_FOUND } from '../../domain/customer.errors';

interface IGetCustomerInfoServiceInput {
  customerId: string;
}

interface IGetCustomerInfoServiceOutput {
  id: string;
  name: string;
  email: string;
}

@Injectable()
class GetCustomerInfoService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    input: IGetCustomerInfoServiceInput,
  ): Promise<Output<IGetCustomerInfoServiceOutput> | Output<IError>> {
    try {
      const id = IdValueObject.init({ value: input.customerId }).result as IdValueObject;
      const customer = await this.customerRepository.findById(id);
      if (!customer) return Output.fail(CUSTOMER_NOT_FOUND);

      return Output.success({
        id: customer.id.value,
        name: customer.name.value,
        email: customer.email.value,
      });
    } catch (error) {
      return throwFailInternalServer(error);
    }
  }
}

export {
  GetCustomerInfoService,
  IGetCustomerInfoServiceInput,
  IGetCustomerInfoServiceOutput,
};
