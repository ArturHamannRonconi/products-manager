import { NameValueObject } from './name.value-object';

describe('NameValueObject (customer)', () => {
  it('should create a valid name', () => {
    const result = NameValueObject.init({ value: 'John Doe' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as NameValueObject;
    expect(vo.value).toBe('John Doe');
  });

  it('should fail when name is too short', () => {
    const result = NameValueObject.init({ value: 'J' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe('Name must be between 2 and 100 characters.');
  });

  it('should fail when name is too long', () => {
    const result = NameValueObject.init({ value: 'A'.repeat(101) });
    expect(result.isFailure).toBe(true);
  });

  it('should sanitize by trimming whitespace', () => {
    const result = NameValueObject.init({ value: '  John  ' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as NameValueObject;
    expect(vo.value).toBe('John');
  });
});
