import { ChangeCustomerNameService } from './change-customer-name.service';
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
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    refreshTokens: [],
  }).result as CustomerAggregate;
}

describe('ChangeCustomerNameService', () => {
  it('should change name successfully', async () => {
    const customer = buildCustomer();
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(customer),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeCustomerNameService(repo);

    const result = await service.execute({
      customerId: customer.id.value,
      name: 'Jane Doe',
    });

    expect(result.isSuccess).toBe(true);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail when customer not found', async () => {
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeCustomerNameService(repo);

    const result = await service.execute({
      customerId: 'non-existent-id',
      name: 'Jane Doe',
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(404);
  });
});
