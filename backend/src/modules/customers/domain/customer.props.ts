import { IBaseDomainAggregate } from 'ddd-tool-kit';
import { NameValueObject } from './value-objects/name/name.value-object';
import { EmailValueObject } from './value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../shared/value-objects/password/password.value-object';
import { RefreshTokenEntity } from './entities/refresh-token/refresh-token.entity';

interface ICustomerProps extends IBaseDomainAggregate {
  name: NameValueObject;
  email: EmailValueObject;
  password: PasswordValueObject;
  refreshTokens: RefreshTokenEntity[];
}

export { ICustomerProps };
