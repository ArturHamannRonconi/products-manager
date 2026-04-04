import { HttpStatus } from 'ddd-tool-kit';

export const INVALID_AMOUNT = {
  message: 'Amount must be at least 1.',
  statusCode: HttpStatus.BAD_REQUEST,
};
