import { IdValueObject } from 'ddd-tool-kit';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';

interface CustomerRepository {
  findById(id: IdValueObject): Promise<CustomerAggregate | null>;
  findByEmail(email: EmailValueObject): Promise<CustomerAggregate | null>;
  findByRefreshToken(rawToken: string): Promise<CustomerAggregate | null>;
  save(customer: CustomerAggregate): Promise<void>;
}

export { CustomerRepository };
