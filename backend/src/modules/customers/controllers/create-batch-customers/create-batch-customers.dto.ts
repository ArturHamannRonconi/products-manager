import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateCustomerItemDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}

export class CreateBatchCustomersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerItemDto)
  customers: CreateCustomerItemDto[];
}
