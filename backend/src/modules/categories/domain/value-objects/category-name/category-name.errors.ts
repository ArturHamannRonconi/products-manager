import { HttpStatus } from 'ddd-tool-kit';

const INVALID_CATEGORY_NAME = {
  message: 'Category name must be between 1 and 100 characters.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export { INVALID_CATEGORY_NAME };
