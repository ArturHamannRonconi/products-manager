import { HttpStatus } from 'ddd-tool-kit';

const INVALID_PRODUCT_DESCRIPTION = {
  message: 'Product description must be between 1 and 1000 characters.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export { INVALID_PRODUCT_DESCRIPTION };
