import {
  IBidirectionalMapper,
  IdValueObject,
  DateValueObject,
} from 'ddd-tool-kit';
import { Injectable } from '@nestjs/common';
import { ICustomerSchema } from './schema/customer.schema';
import { CustomerAggregate } from '../../domain/customer.aggregate-root';
import { NameValueObject } from '../../domain/value-objects/name/name.value-object';
import { EmailValueObject } from '../../domain/value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../../shared/value-objects/password/password.value-object';
import { RefreshTokenMapper } from './refresh-token.mapper';

@Injectable()
class CustomerMapper implements IBidirectionalMapper<ICustomerSchema, CustomerAggregate> {
  constructor(private readonly refreshTokenMapper: RefreshTokenMapper) {}

  toRightSide(leftSide: ICustomerSchema): CustomerAggregate {
    return CustomerAggregate.init({
      id: IdValueObject.init({ value: leftSide.id }).result as IdValueObject,
      name: NameValueObject.init({ value: leftSide.name }).result as NameValueObject,
      email: EmailValueObject.init({ value: leftSide.email }).result as EmailValueObject,
      password: PasswordValueObject.init({
        value: leftSide.password,
      }).result as PasswordValueObject,
      refreshTokens: leftSide.refresh_tokens.map((rt) =>
        this.refreshTokenMapper.toRightSide(rt),
      ),
      createdAt: DateValueObject.init({
        value: leftSide.created_at,
      }).result as DateValueObject,
      updatedAt: DateValueObject.init({
        value: leftSide.updated_at,
      }).result as DateValueObject,
    }).result as CustomerAggregate;
  }

  toLeftSide(rightSide: CustomerAggregate): ICustomerSchema {
    return {
      id: rightSide.id.value,
      name: rightSide.name.value,
      email: rightSide.email.value,
      password: rightSide.password.value,
      refresh_tokens: rightSide.refreshTokens.map((rt) =>
        this.refreshTokenMapper.toLeftSide(rt),
      ),
      created_at: rightSide.createdAt.value,
      updated_at: rightSide.updatedAt.value,
    };
  }
}

export { CustomerMapper };
