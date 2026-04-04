import { OrganizationNameValueObject } from './organization-name.value-object';

describe('OrganizationNameValueObject', () => {
  it('should create a valid organization name', () => {
    const result = OrganizationNameValueObject.init({ value: 'Acme Corp' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as OrganizationNameValueObject;
    expect(vo.value).toBe('Acme Corp');
  });

  it('should fail when name is too short', () => {
    const result = OrganizationNameValueObject.init({ value: 'A' });
    expect(result.isFailure).toBe(true);
    const error = result.result as { message: string };
    expect(error.message).toBe(
      'Organization name must be between 2 and 100 characters.',
    );
  });

  it('should fail when name is too long', () => {
    const result = OrganizationNameValueObject.init({
      value: 'A'.repeat(101),
    });
    expect(result.isFailure).toBe(true);
  });

  it('should sanitize by trimming whitespace', () => {
    const result = OrganizationNameValueObject.init({
      value: '  Acme Corp  ',
    });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as OrganizationNameValueObject;
    expect(vo.value).toBe('Acme Corp');
  });
});
