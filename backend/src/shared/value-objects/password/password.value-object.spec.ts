import * as bcryptjs from 'bcryptjs';
import { PasswordValueObject } from './password.value-object';

describe('PasswordValueObject', () => {
  it('should create a valid password with 8+ characters', () => {
    const result = PasswordValueObject.init({ value: 'mypassword123' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as PasswordValueObject;
    expect(vo.value).toBeDefined();
    expect(vo.value.startsWith('$2')).toBe(true);
  });

  it('should fail when password is less than 8 characters', () => {
    const result = PasswordValueObject.init({ value: 'short' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string; statusCode: number };
    expect(error.message).toBe('Password must be at least 8 characters.');
    expect(error.statusCode).toBe(400);
  });

  it('should not re-hash an already hashed password', () => {
    const hash = bcryptjs.hashSync('mypassword123', bcryptjs.genSaltSync());
    const result = PasswordValueObject.init({ value: hash });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as PasswordValueObject;
    expect(vo.value).toBe(hash);
  });

  it('should return true for comparePassword with correct plain password', () => {
    const plain = 'mypassword123';
    const result = PasswordValueObject.init({ value: plain });
    const vo = result.result as PasswordValueObject;
    expect(vo.comparePassword(plain)).toBe(true);
  });

  it('should return false for comparePassword with wrong password', () => {
    const result = PasswordValueObject.init({ value: 'mypassword123' });
    const vo = result.result as PasswordValueObject;
    expect(vo.comparePassword('wrongpassword')).toBe(false);
  });
});
