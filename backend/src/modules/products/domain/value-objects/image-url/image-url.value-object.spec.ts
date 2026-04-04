import { ImageUrlValueObject } from './image-url.value-object';

describe('ImageUrlValueObject', () => {
  it('should create with a valid URL string', () => {
    const result = ImageUrlValueObject.init({ value: 'https://example.com/image.jpg' });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as ImageUrlValueObject;
    expect(vo.value).toBe('https://example.com/image.jpg');
  });

  it('should create with null value', () => {
    const result = ImageUrlValueObject.init({ value: null });
    expect(result.isSuccess).toBe(true);
    const vo = result.result as ImageUrlValueObject;
    expect(vo.value).toBeNull();
  });
});
