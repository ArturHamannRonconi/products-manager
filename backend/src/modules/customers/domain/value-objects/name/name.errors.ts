import { HttpStatus } from 'ddd-tool-kit';

export const INVALID_NAME = {
  message: 'Name must be between 2 and 100 characters.',
  statusCode: HttpStatus.BAD_REQUEST,
};
