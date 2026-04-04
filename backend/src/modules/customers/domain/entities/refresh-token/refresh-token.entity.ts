import {
  Entity,
  Output,
  IdValueObject,
  DateValueObject,
  verifyAllPropsExists,
  verifyAreValueObjects,
  IBaseDomainEntity,
  HttpStatus,
} from 'ddd-tool-kit';
import * as bcryptjs from 'bcryptjs';

interface IRefreshTokenProps extends IBaseDomainEntity {
  expiresAt: DateValueObject;
  createdAt?: DateValueObject;
  updatedAt?: DateValueObject;
}

const INVALID_REFRESH_TOKEN = {
  message: 'Invalid refresh token.',
  statusCode: HttpStatus.BAD_REQUEST,
};

class RefreshTokenEntity extends Entity<IRefreshTokenProps> {
  private static readonly EXPIRATION_DAYS = 30;

  private constructor(props: IRefreshTokenProps) {
    super(props);
  }

  get expiresAt(): DateValueObject {
    return this.props.expiresAt;
  }

  get createdAt(): DateValueObject {
    return this.props.createdAt!;
  }

  get updatedAt(): DateValueObject {
    return this.props.updatedAt!;
  }

  get hash(): string {
    const salt = bcryptjs.genSaltSync();
    return bcryptjs.hashSync(this.id.value, salt);
  }

  get secondsUntilExpiration(): number {
    const now = new Date();
    const expiresAt = this.props.expiresAt.value;
    const diffInSeconds = Math.floor(
      (expiresAt.getTime() - now.getTime()) / 1000,
    );
    return Math.max(diffInSeconds, 0);
  }

  renew(): void {
    this.props.id = IdValueObject.getDefault();
    this.props.expiresAt = DateValueObject.getDefault();
    this.props.expiresAt.addDays(RefreshTokenEntity.EXPIRATION_DAYS);
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    const valueObjects = ['expiresAt', ...this.defaultValueObjects];
    const requiredProps = [...valueObjects];
    const allPropsExists = verifyAllPropsExists(requiredProps, this);
    const areValueObjects = verifyAreValueObjects(valueObjects, this);
    return allPropsExists && areValueObjects;
  }

  static init(props: IRefreshTokenProps) {
    const entity = new RefreshTokenEntity(props);

    const isInvalidProps = !entity.isValidProps();
    if (isInvalidProps) return Output.fail(INVALID_REFRESH_TOKEN);

    return Output.success(entity);
  }
}

export { RefreshTokenEntity, IRefreshTokenProps };
