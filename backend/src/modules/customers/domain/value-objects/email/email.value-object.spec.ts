import { EmailValueObject } from './email.value-object';

describe('EmailValueObject (customer)', () => {
  it('should create a valid email', () => {
    const result = EmailValueObject.init({ value: 'john@example.com' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as EmailValueObject;
    expect(vo.value).toBe('john@example.com');
  });

  it('should fail with invalid email', () => {
    const result = EmailValueObject.init({ value: 'notanemail' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Invalid email format.');
  });

  it('should normalize to lowercase and trim', () => {
    const result = EmailValueObject.init({ value: '  JOHN@EXAMPLE.COM  ' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as EmailValueObject;
    expect(vo.value).toBe('john@example.com');
  });
});
