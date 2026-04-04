import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateSellerItemDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() organization_name: string;
}

export class CreateBatchSellersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSellerItemDto)
  sellers: CreateSellerItemDto[];
}
