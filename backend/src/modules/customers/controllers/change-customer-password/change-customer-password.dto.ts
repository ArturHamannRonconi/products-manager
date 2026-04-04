import { IsString, MinLength } from 'class-validator';

export class ChangeCustomerPasswordDto {
  @IsString() @MinLength(8) oldPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}
