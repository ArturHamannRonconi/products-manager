import { HttpStatus } from 'ddd-tool-kit';

export const CUSTOMER_INVALID_PROPS = {
  message: 'Invalid customer props.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export const CUSTOMER_EMAIL_ALREADY_EXISTS = {
  message: 'Customer email already exists!',
  statusCode: HttpStatus.CONFLICT,
};

export const CUSTOMER_EMAIL_OR_PASSWORD_INCORRECT = {
  message: 'Customer email or password is incorrect!',
  statusCode: HttpStatus.UNAUTHORIZED,
};

export const CUSTOMER_INVALID_ACCESS_TOKEN = {
  message: 'Invalid access token!',
  statusCode: HttpStatus.FORBIDDEN,
};

export const CUSTOMER_INVALID_REFRESH_TOKEN = {
  message: 'Invalid refresh token!',
  statusCode: HttpStatus.FORBIDDEN,
};

export const CUSTOMER_NOT_FOUND = {
  message: 'Customer not found.',
  statusCode: HttpStatus.NOT_FOUND,
};
