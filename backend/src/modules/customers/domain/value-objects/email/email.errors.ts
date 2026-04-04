import { HttpStatus } from 'ddd-tool-kit';

export const INVALID_EMAIL = {
  message: 'Invalid email format.',
  statusCode: HttpStatus.BAD_REQUEST,
};
