import { JwtService } from '@nestjs/jwt';
import { CustomerLoginService } from './customer-login.service';
import { CustomerRepository } from '../../repositories/customers/customer-repository.interface';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';

function buildCustomer(password = 'password123') {
  return CustomerAggregate.init({
    id: IdValueObject.getDefault(),
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
    name: NameValueObject.init({ value: 'John' }).result as NameValueObject,
    email: EmailValueObject.init({ value: 'john@example.com' }).result as EmailValueObject,
    password: PasswordValueObject.init({ value: password }).result as PasswordValueObject,
    refreshTokens: [],
  }).result as CustomerAggregate;
}

function makeRepo(customer: CustomerAggregate | null = null): CustomerRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(customer),
    findByRefreshToken: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

const mockJwt = { sign: jest.fn().mockReturnValue('mock.jwt.token') } as unknown as JwtService;

describe('CustomerLoginService', () => {
  it('should login successfully', async () => {
    const customer = buildCustomer();
    const repo = makeRepo(customer);
    const service = new CustomerLoginService(repo, mockJwt);

    const result = await service.execute({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(result.isSuccess).toBe(true);
    const output = result.result as { access_token: string; refresh_token: string };
    expect(output.access_token).toBe('mock.jwt.token');
    expect(output.refresh_token).toBeDefined();
  });

  it('should fail when email not found', async () => {
    const repo = makeRepo(null);
    const service = new CustomerLoginService(repo, mockJwt);

    const result = await service.execute({
      email: 'notfound@example.com',
      password: 'password123',
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(401);
  });

  it('should fail when password is wrong', async () => {
    const customer = buildCustomer('correctpassword123');
    const repo = makeRepo(customer);
    const service = new CustomerLoginService(repo, mockJwt);

    const result = await service.execute({
      email: 'john@example.com',
      password: 'wrongpassword',
    });

    expect(result.isFailure).toBe(true);
    const error = result.result as { statusCode: number };
    expect(error.statusCode).toBe(401);
  });
});
