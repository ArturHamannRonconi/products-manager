import { IBaseDomainEntity, IdValueObject, DateValueObject } from 'ddd-tool-kit';
import { AmountValueObject } from '../../value-objects/amount/amount.value-object';

interface IOrderItemProps extends IBaseDomainEntity {
  productId: IdValueObject;
  ammount: AmountValueObject;
  createdAt?: DateValueObject;
  updatedAt?: DateValueObject;
}

export { IOrderItemProps };
