import { Output, ValueObject } from 'ddd-tool-kit';
import { INVALID_ORGANIZATION_NAME } from './organization-name.errors';
import { IOrganizationNameValueObject } from './organization-name.props';

class OrganizationNameValueObject extends ValueObject<IOrganizationNameValueObject> {
  private constructor(props: IOrganizationNameValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {
    this.props.value = this.props.value.trim();
  }

  protected isValidProps(): boolean {
    const trimmed = this.props.value.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
  }

  static init(props: IOrganizationNameValueObject) {
    const vo = new OrganizationNameValueObject(props);
    vo.sanitizeProps();

    const isInvalidProps = !vo.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_ORGANIZATION_NAME);

    return Output.success(vo);
  }
}

export { OrganizationNameValueObject };
