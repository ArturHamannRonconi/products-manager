import { DateValueObject, IdValueObject } from 'ddd-tool-kit';
import { RefreshTokenEntity } from './refresh-token.entity';

function createValidToken() {
  const expiresAt = DateValueObject.getDefault();
  expiresAt.addDays(30);
  return RefreshTokenEntity.init({
    id: IdValueObject.getDefault(),
    expiresAt,
    createdAt: DateValueObject.getDefault(),
    updatedAt: DateValueObject.getDefault(),
  });
}

describe('RefreshTokenEntity', () => {
  it('should create a valid refresh token', () => {
    const result = createValidToken();
    expect(result.isSuccess).toBe(true);
    const entity = result.result as RefreshTokenEntity;
    expect(entity.id.value).toBeDefined();
    expect(entity.secondsUntilExpiration).toBeGreaterThan(0);
  });

  it('should renew resets id and expiration', () => {
    const result = createValidToken();
    const entity = result.result as RefreshTokenEntity;
    const oldId = entity.id.value;
    const oldExpires = entity.expiresAt.value.getTime();

    entity.renew();

    expect(entity.id.value).not.toBe(oldId);
    expect(entity.expiresAt.value.getTime()).toBeGreaterThanOrEqual(oldExpires);
  });

  it('secondsUntilExpiration is never negative', () => {
    const expiresAt = DateValueObject.getDefault();
    expiresAt.addDays(-1);
    const result = RefreshTokenEntity.init({
      id: IdValueObject.getDefault(),
      expiresAt,
      createdAt: DateValueObject.getDefault(),
      updatedAt: DateValueObject.getDefault(),
    });
    const entity = result.result as RefreshTokenEntity;
    expect(entity.secondsUntilExpiration).toBe(0);
  });
});
