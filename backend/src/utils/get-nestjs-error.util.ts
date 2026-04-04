import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Output, IError } from 'ddd-tool-kit';

export function getCorrectNestjsErrorByOutput(output: Output<IError>): HttpException {
  const error = output.result as IError;
  const { statusCode, message } = error;

  switch (statusCode) {
    case 400:
      return new BadRequestException(message);
    case 401:
      return new UnauthorizedException(message);
    case 403:
      return new ForbiddenException(message);
    case 404:
      return new NotFoundException(message);
    case 409:
      return new ConflictException(message);
    default:
      return new InternalServerErrorException(message);
  }
}
