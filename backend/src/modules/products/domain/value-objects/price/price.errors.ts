import { HttpStatus } from 'ddd-tool-kit';

const INVALID_PRICE = {
  message: 'Price must be greater than 0.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export { INVALID_PRICE };
