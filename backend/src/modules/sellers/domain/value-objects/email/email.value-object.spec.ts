import { EmailValueObject } from './email.value-object';

describe('EmailValueObject', () => {
  it('should create a valid email', () => {
    const result = EmailValueObject.init({ value: 'test@example.com' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as EmailValueObject;
    expect(vo.value).toBe('test@example.com');
  });

  it('should fail for invalid email format', () => {
    const result = EmailValueObject.init({ value: 'notanemail' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Invalid email format.');
  });

  it('should sanitize by lowercasing and trimming', () => {
    const result = EmailValueObject.init({ value: '  TEST@EXAMPLE.COM  ' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as EmailValueObject;
    expect(vo.value).toBe('test@example.com');
  });
});
