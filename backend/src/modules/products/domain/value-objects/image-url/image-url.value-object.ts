import { Output, ValueObject } from 'ddd-tool-kit';
import { IImageUrlValueObject } from './image-url.props';

class ImageUrlValueObject extends ValueObject<IImageUrlValueObject> {
  private constructor(props: IImageUrlValueObject) {
    super(props);
  }

  protected sanitizeProps(): void {}

  protected isValidProps(): boolean {
    return this.props.value === null || typeof this.props.value === 'string';
  }

  static init(props: IImageUrlValueObject) {
    const vo = new ImageUrlValueObject(props);
    return Output.success(vo);
  }
}

export { ImageUrlValueObject };
