import { IsString, MinLength } from 'class-validator';

export class ChangeSellerPasswordDto {
  @IsString() oldPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}
