import { CreateBatchCustomersService } from './create-batch-customers.service';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

function makeRepo(overrides: Partial<CustomerRepository> = {}): CustomerRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    findByRefreshToken: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CreateBatchCustomersService', () => {
  it('should create customers successfully', async () => {
    const repo = makeRepo();
    const service = new CreateBatchCustomersService(repo);

    const result = await service.execute({
      customers: [
        { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      ],
    });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { customers: { id: string }[] };
    expect(output.customers).toHaveLength(1);
    expect(output.customers[0].id).toBeDefined();
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail with CUSTOMER_EMAIL_ALREADY_EXISTS when email is taken', async () => {
    const existingCustomer = CustomerAggregate.init({
      id: IdValueObject.getDefault(),
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
      name: NameValueObject.init({ value: 'Existing' }).result as NameValueObject,
      email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
      password: PasswordValueObject.init({ value: 'password123' }).result as PasswordValueObject,
      refreshTokens: [],
    }).result as CustomerAggregate;

    const repo = makeRepo({ findByEmail: jest.fn().mockResolvedValue(existingCustomer) });
    const service = new CreateBatchCustomersService(repo);

    const result = await service.execute({
      customers: [
        { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      ],
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string; statusCode: number };
    expect(error.message).toBe('Customer email already exists!');
    expect(error.statusCode).toBe(409);
  });
});
