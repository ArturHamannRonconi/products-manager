import { HttpStatus } from 'ddd-tool-kit';

const INVALID_CATEGORY = {
  message: 'Invalid category props.',
  statusCode: HttpStatus.BAD_REQUEST,
};

const CATEGORY_NOT_FOUND = {
  message: 'Category not found.',
  statusCode: HttpStatus.NOT_FOUND,
};

export { INVALID_CATEGORY, CATEGORY_NOT_FOUND };
