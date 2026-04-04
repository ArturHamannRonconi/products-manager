import {
  Aggregate,
  Output,
  verifyAllPropsExists,
  verifyAreValueObjects,
} from 'ddd-tool-kit';
import { ICategoryProps } from './category.props';
import { INVALID_CATEGORY } from './category.errors';
import { CategoryNameValueObject } from './value-objects/category-name/category-name.value-object';

class CategoryAggregate extends Aggregate<ICategoryProps> {
  private constructor(props: ICategoryProps) {
    super(props);
  }

  get name(): CategoryNameValueObject {
    return this.props.name;
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    const valueObjects = ['name', ...this.defaultValueObjects];
    const allPropsExists = verifyAllPropsExists(valueObjects, this);
    const areValueObjects = verifyAreValueObjects(['name'], this);
    return allPropsExists && areValueObjects;
  }

  static init(props: ICategoryProps) {
    const category = new CategoryAggregate(props);

    const isInvalidProps = !category.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_CATEGORY);

    return Output.success(category);
  }
}

export { CategoryAggregate };
