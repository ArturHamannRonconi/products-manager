import { IsString, MinLength } from 'class-validator';

export class ChangeCustomerNameDto {
  @IsString() @MinLength(2) name: string;
}
