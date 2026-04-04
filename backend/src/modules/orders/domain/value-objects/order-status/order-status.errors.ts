import { HttpStatus } from 'ddd-tool-kit';

export const INVALID_ORDER_STATUS = {
  message: 'Invalid order status.',
  statusCode: HttpStatus.BAD_REQUEST,
};
