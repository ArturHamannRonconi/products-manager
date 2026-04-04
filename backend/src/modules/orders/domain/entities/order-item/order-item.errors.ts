import { HttpStatus } from 'ddd-tool-kit';

export const INVALID_ORDER_ITEM = {
  message: 'Invalid order item props.',
  statusCode: HttpStatus.BAD_REQUEST,
};
