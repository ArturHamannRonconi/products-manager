import { IBaseDomainAggregate } from 'ddd-tool-kit';
import { CategoryNameValueObject } from './value-objects/category-name/category-name.value-object';

interface ICategoryProps extends IBaseDomainAggregate {
  name: CategoryNameValueObject;
}

export { ICategoryProps };
