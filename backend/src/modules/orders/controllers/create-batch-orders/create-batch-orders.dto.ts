import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class OrderItemDto {
  @ApiProperty()
  @IsString()
  product_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  ammount: number;
}

class OrderInputDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  products: OrderItemDto[];
}

class CreateBatchOrdersDto {
  @ApiProperty({ type: [OrderInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderInputDto)
  orders: OrderInputDto[];
}

export { CreateBatchOrdersDto };
