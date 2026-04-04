import { HttpStatus } from 'ddd-tool-kit';

const INVALID_PRODUCT_NAME = {
  message: 'Product name must be between 1 and 200 characters.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export { INVALID_PRODUCT_NAME };
