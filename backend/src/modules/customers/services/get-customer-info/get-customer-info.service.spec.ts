import { GetCustomerInfoService } from './get-customer-info.service';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

function buildCustomer() {
  return CustomerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John Doe' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    refreshTokens: [],
  }).result as CustomerAggregate;
}

describe('GetCustomerInfoService', () => {
  it('should return customer info', async () => {
    const customer = buildCustomer();
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(customer),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new GetCustomerInfoService(repo);

    const result = await service.execute({ customerId: customer.id.value });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { id: string; name: string; email: string };
    expect(output.name).toBe('John Doe');
    expect(output.email).toBe('john@example.com');
  });

  it('should fail when customer not found', async () => {
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new GetCustomerInfoService(repo);

    const result = await service.execute({ customerId: 'non-existent-id' });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(404);
  });
});
