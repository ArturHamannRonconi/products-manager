import {
  IBidirectionalMapper,
  IdValueObject,
  DateValueObject,
} from 'ddd-tool-kit';
import { IRefreshTokenSchema } from './schema/customer.schema';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token/refresh-token.entity';

class RefreshTokenMapper
  implements IBidirectionalMapper<IRefreshTokenSchema, RefreshTokenEntity>
{
  toRightSide(leftSide: IRefreshTokenSchema): RefreshTokenEntity {
    return RefreshTokenEntity.init({
      id: IdValueObject.init({ value: leftSide.id }).result as IdValueObject,
      expiresAt: DateValueObject.init({
        value: leftSide.expires_at,
      }).result as DateValueObject,
      createdAt: DateValueObject.init({
        value: leftSide.created_at,
      }).result as DateValueObject,
      updatedAt: DateValueObject.init({
        value: leftSide.updated_at,
      }).result as DateValueObject,
    }).result as RefreshTokenEntity;
  }

  toLeftSide(rightSide: RefreshTokenEntity): IRefreshTokenSchema {
    return {
      id: rightSide.id.value,
      expires_at: rightSide.expiresAt.value,
      created_at: rightSide.createdAt.value,
      updated_at: rightSide.updatedAt.value,
    };
  }
}

export { RefreshTokenMapper };
