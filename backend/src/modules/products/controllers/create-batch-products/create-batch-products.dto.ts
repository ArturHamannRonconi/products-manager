import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class CreateProductItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  inventory_ammount: number;
}

class CreateBatchProductsDto {
  @ApiProperty({ type: [CreateProductItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductItemDto)
  products: CreateProductItemDto[];
}

export { CreateBatchProductsDto };
