import { HttpStatus } from 'ddd-tool-kit';

export const SELLER_INVALID_PROPS = {
  message: 'Invalid seller props.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export const SELLER_EMAIL_ALREADY_EXISTS = {
  message: 'Seller email already exists!',
  statusCode: HttpStatus.CONFLICT,
};

export const SELLER_EMAIL_OR_PASSWORD_INCORRECT = {
  message: 'Seller email or password is incorrect!',
  statusCode: HttpStatus.UNAUTHORIZED,
};

export const SELLER_INVALID_ACCESS_TOKEN = {
  message: 'Invalid access token!',
  statusCode: HttpStatus.FORBIDDEN,
};

export const SELLER_INVALID_REFRESH_TOKEN = {
  message: 'Invalid refresh token!',
  statusCode: HttpStatus.FORBIDDEN,
};

export const SELLER_NOT_FOUND = {
  message: 'Seller not found.',
  statusCode: HttpStatus.NOT_FOUND,
};
