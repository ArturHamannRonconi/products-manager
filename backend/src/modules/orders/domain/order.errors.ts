import { HttpStatus } from 'ddd-tool-kit';

export const INVALID_ORDER = { message: 'Invalid order props.', statusCode: HttpStatus.BAD_REQUEST };
export const INVALID_ORDER_STATUS = { message: 'Invalid order status.', statusCode: HttpStatus.BAD_REQUEST };
export const ORDER_NOT_FOUND = { message: 'Order not found.', statusCode: HttpStatus.NOT_FOUND };
export const INSUFFICIENT_STOCK = { message: 'Insufficient stock for product: ', statusCode: HttpStatus.BAD_REQUEST };
export const ORDER_FORBIDDEN = { message: 'Invalid access token!', statusCode: HttpStatus.FORBIDDEN };
export const ORDER_OWNERSHIP_FORBIDDEN = { message: 'You do not have permission to update this order.', statusCode: HttpStatus.FORBIDDEN };
export const INVALID_STATUS_TRANSITION = { message: 'Invalid status transition.', statusCode: HttpStatus.BAD_REQUEST };
