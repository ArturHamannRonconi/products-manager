import { ChangeCustomerEmailService } from './change-customer-email.service';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

function buildCustomer(email = 'john@example.com') {
  return CustomerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: email }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
    refreshTokens: [],
  }).result as CustomerAggregate;
}

describe('ChangeCustomerEmailService', () => {
  it('should change email successfully', async () => {
    const customer = buildCustomer();
    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(customer),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeCustomerEmailService(repo);

    const result = await service.execute({
      customerId: customer.id.value,
      email: 'newemail@example.com',
    });

    expect(result.isSuccess).toBe(true);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail when email is already taken by another customer', async () => {
    const customer = buildCustomer('john@example.com');
    const otherCustomer = buildCustomer('other@example.com');

    const repo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue(customer),
      findByEmail: jest.fn().mockResolvedValue(otherCustomer),
      findByRefreshToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ChangeCustomerEmailService(repo);

    const result = await service.execute({
      customerId: customer.id.value,
      email: 'other@example.com',
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(409);
  });
});
