import { HttpStatus } from 'ddd-tool-kit';

const INVALID_IMAGE_URL = {
  message: 'Invalid image URL.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export { INVALID_IMAGE_URL };
