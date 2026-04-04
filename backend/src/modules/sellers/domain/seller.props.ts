import { IBaseDomainAggregate } from 'ddd-tool-kit';
import { NameValueObject } from './value-objects/name/name.value-object';
import { EmailValueObject } from './value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../shared/value-objects/password/password.value-object';
import { OrganizationNameValueObject } from './value-objects/organization-name/organization-name.value-object';
import { RefreshTokenEntity } from './entities/refresh-token/refresh-token.entity';

interface ISellerProps extends IBaseDomainAggregate {
  name: NameValueObject;
  email: EmailValueObject;
  password: PasswordValueObject;
  organizationName: OrganizationNameValueObject;
  refreshTokens: RefreshTokenEntity[];
}

export { ISellerProps };
