import { HttpStatus } from 'ddd-tool-kit';

export const PRODUCT_NOT_FOUND = { message: 'Product not found.', statusCode: HttpStatus.NOT_FOUND };
export const INVALID_PRODUCT = { message: 'Invalid product props.', statusCode: HttpStatus.BAD_REQUEST };
export const PRODUCT_FORBIDDEN = { message: 'Invalid access token!', statusCode: HttpStatus.FORBIDDEN };
